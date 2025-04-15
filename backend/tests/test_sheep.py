# import testing tools
import pytest
from httpx import AsyncClient, ASGITransport

import sys
import os

# add the backend folder to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


# post sheep
@pytest.mark.asyncio
async def test_create_sheep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        # use direct SQL insert with SQLAlchemy
        from database import SessionLocal
        from models.farm import Farm
        from models.sheep import Sheep

        with SessionLocal() as db:

            # clear the table so tests don't conflict
            db.query(Sheep).delete()
            db.commit()

            farm = db.query(Farm).filter_by(name="Test Farm").first()
            if not farm:
                farm = Farm(name="Test Farm", location="Test Land")
                db.add(farm)
                db.commit()
                db.refresh(farm)  # now farm.id is available


        # create a sheep assigned to farm_id=1
        response = await ac.post("/sheep/", json={
            "birth_date": "2023-04-01",
            "farm_id": farm.id,
            "milk_production": 4.2,
            "feeding_hay": 1.5,
            "feeding_feed": 0.5,
            "gender": "femea",
            "status": "borrego"
        })

    assert response.status_code == 200
    assert response.json()["farm_id"] == farm.id



# get sheep
@pytest.mark.asyncio
async def test_get_all_sheep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # call the endpoint
        response = await ac.get("/sheep/")

    # check that it returns status code 200 (OK)
    assert response.status_code == 200

    # make sure it sends a list back
    assert isinstance(response.json(), list)

    # make sure at least 1 sheep is there
    assert len(response.json()) >= 1


# get sheep by id
@pytest.mark.asyncio
async def test_get_sheep_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        from database import SessionLocal
        from models.farm import Farm
        from models.sheep import Sheep

        with SessionLocal() as db:
            db.query(Sheep).delete()
            db.commit()

            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Test Farm", location="Test Land")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            sheep = Sheep(
                birth_date="2023-04-01",
                farm_id=farm.id,
                milk_production=4.2,
                feeding_hay=1.5,
                feeding_feed=0.5,
                gender="femea",
                status="borrego"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
        
        
        response = await ac.get(f"/sheep/{sheep.id}")
    
    assert response.status_code == 200

    print("\n RESPONSE JSON:", response.json())

    assert response.json()["id"] == sheep.id

