
import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

# add backend folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


# post farmer
@pytest.mark.asyncio
async def test_create_farmer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        from database import SessionLocal
        from models.farm import Farm
        from models.farmer import Farmer

        # insert a farm
        with SessionLocal() as db:
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            farm = db.query(Farm).filter_by(name="FarmerTest Farm").first()
            if not farm:
                farm = Farm(name="FarmerTest Farm", location="Somewhere")
                db.add(farm)
                db.commit()
                db.refresh(farm)

        # create a farmer
        response = await ac.post("/farmer/", json={
            "name": "Test Farmer",
            "email": "farmer@example.com",
            "password": "securepassword",
            "farm_id": farm.id
        })

    # check response
    assert response.status_code == 200
    assert response.json()["email"] == "farmer@example.com"




# get farmer by id
@pytest.mark.asyncio
async def test_get_farmer_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from database import SessionLocal
        from models.farm import Farm
        from models.farmer import Farmer

        with SessionLocal() as db:
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Farm for Get", location="Someplace")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            # create a farmer
            farmer = Farmer(
                name="Test Farmer",
                email="farmer@example.com",
                password="securepassword",
                farm_id=farm.id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            farmer_id = farmer.id

        # GET the farmer by ID
        response = await ac.get(f"/farmer/{farmer_id}")

        assert response.status_code == 200
        assert response.json()["id"] == farmer_id
        assert response.json()["email"] == "farmer@example.com"



# put farmer
@pytest.mark.asyncio
async def test_update_farmer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from database import SessionLocal
        from models.farm import Farm
        from models.farmer import Farmer

        with SessionLocal() as db:
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # ensure a farm exists
            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Farm Update", location="Update Land")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            # store farm_id
            farm_id = farm.id

            # create a farmer
            farmer = Farmer(
                name="Update Test",
                email="update@farmer.com",
                password="original",
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            farmer_id = farmer.id

        # Perform update
        response = await ac.put(f"/farmer/{farmer_id}", json={
            "name": "Updated Name",
            "email": "updated@email.com",
            "password": "updatedpass",
            "farm_id": farm_id
        })

        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"
        assert response.json()["email"] == "updated@email.com"
