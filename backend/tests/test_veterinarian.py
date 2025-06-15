
import pytest
from httpx import AsyncClient, ASGITransport
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

# post veterinarian
@pytest.mark.asyncio
async def test_create_veterinarian():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from database import SessionLocal
        from farm.model_farm import Farm
        from farmer.model_farmer import Farmer
        from veterinarian.model_veterinarian import Veterinarian

        # prepare db
        with SessionLocal() as db:
            db.query(Veterinarian).delete()
            db.commit()

            # create farm
            farm = db.query(Farm).filter_by(name="Vet Farm").first()
            if not farm:
                farm = Farm(name="Vet Farm", location="Vetland")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            # save farm id
            farm_id = farm.id

            # create farmer
            farmer = db.query(Farmer).filter_by(email="vetowner@example.com").first()
            if not farmer:
                farmer = Farmer(
                    name="Farmer for Vet",
                    email="vetowner@example.com",
                    password="123456",
                    farm_id=farm_id
                )
                db.add(farmer)
                db.commit()
                db.refresh(farmer)

        # send POST
        response = await ac.post("/vet/", json={
            "name": "Dr. Vet",
            "email": "vet@example.com",
            "password": "securepass",
            "farm_id": farm_id,
            "farmer_id": farmer.id
        })

        assert response.status_code == 200
        assert response.json()["email"] == "vet@example.com"
        assert response.json()["name"] == "Dr. Vet"



# get veterinarian by id
@pytest.mark.asyncio
async def test_get_veterinarian_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from database import SessionLocal
        from backend.farm.model_farm import Farm
        from backend.farmer.model_farmer import Farmer
        from backend.farm.model_veterinarian import Veterinarian

        with SessionLocal() as db:
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.commit()

            # create farm
            farm = db.query(Farm).filter_by(name="Vet Farm").first()
            if not farm:
                farm = Farm(name="Vet Farm", location="Vetland")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            # save farm id
            farm_id = farm.id

            # create farmer
            farmer = db.query(Farmer).filter_by(email="vetowner@example.com").first()
            if not farmer:
                farmer = Farmer(
                    name="Farmer for Vet",
                    email="vetowner@example.com",
                    password="123456",
                    farm_id=farm_id
                )
                db.add(farmer)
                db.commit()
                db.refresh(farmer)


            # create veterinarian
            vet = Veterinarian(
                name="Get Vet",
                email="vet@get.com",
                password="getpass",
                farm_id=farm.id,
                farmer_id=farmer.id
            )
            db.add(vet)
            db.commit()
            db.refresh(vet)
            vet_id = vet.id

        # test GET /vet/{id}
        response = await ac.get(f"/vet/{vet_id}")

        assert response.status_code == 200
        assert response.json()["id"] == vet_id
        assert response.json()["email"] == "vet@get.com"




# put veterinarian by id
@pytest.mark.asyncio
async def test_update_veterinarian():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from database import SessionLocal
        from backend.farm.model_farm import Farm
        from backend.farmer.model_farmer import Farmer
        from backend.farm.model_veterinarian import Veterinarian

        with SessionLocal() as db:
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.commit()

            # Ensure farm exists
            farm = db.query(Farm).filter_by(name="Update Farm").first()
            if not farm:
                farm = Farm(name="Update Farm", location="Updateville")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            farm_id = farm.id

            # Create farmer
            farmer = Farmer(
                name="Update Farmer",
                email="updatefarmer@example.com",
                password="update123",
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            farmer_id = farmer.id

            # Create vet
            vet = Veterinarian(
                name="Old Vet",
                email="old@vet.com",
                password="oldpass",
                farm_id=farm.id,
                farmer_id=farmer_id
            )
            db.add(vet)
            db.commit()
            db.refresh(vet)
            vet_id = vet.id

        # Update request
        update_data = {
            "name": "Updated Vet",
            "email": "updated@vet.com",
            "password": "newpass",
            "farm_id": farm_id,
            "farmer_id": farmer_id
        }

        response = await ac.put(f"/vet/{vet_id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == vet_id
        assert data["name"] == "Updated Vet"
        assert data["email"] == "updated@vet.com"
