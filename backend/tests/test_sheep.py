# import testing tools
import pytest
from httpx import AsyncClient, ASGITransport

from database import SessionLocal
from models.farm import Farm
from models.farmer import Farmer
from models.sheep import Sheep
from utils import hash_password

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




# update sheep
@pytest.mark.asyncio
async def test_update_sheep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        # clear and insert farm + sheep
        with SessionLocal() as db:
            db.query(Sheep).delete()
            db.commit()

            # create/reuse farm
            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Test Farm", location="Test Land")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            # store farm_id
            farm_id = farm.id
            
            # creates sheep
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


            # store sheep_id
            sheep_id = sheep.id


        # update the sheep via PUT
        updated_data = {
            "birth_date": "2023-04-01",
            "farm_id": farm_id,
            "milk_production": 6.1,
            "feeding_hay": 2.0,
            "feeding_feed": 1.0,
            "gender": "femea",
            "status": "ovelha"
        }

        response = await ac.put(f"/sheep/{sheep_id}", json=updated_data)

        assert response.status_code == 200
        assert response.json()["milk_production"] == 6.1
        assert response.json()["status"] == "ovelha"





# delete sheep
@pytest.mark.asyncio
async def test_delete_sheep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        # create farm and sheep
        with SessionLocal() as db:
            db.query(Sheep).delete()
            db.commit()

            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Test Farm", location="Test Land")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            farm_id = farm.id

            sheep = Sheep(
                birth_date="2023-04-01",
                farm_id=farm_id,
                milk_production=3.8,
                feeding_hay=1.0,
                feeding_feed=0.4,
                gender="femea",
                status="ovelha"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)

            sheep_id = sheep.id

        # delete the sheep
        response = await ac.delete(f"/sheep/{sheep_id}")
        assert response.status_code == 204  # no content

        # confirm deletion by checking the GET again
        response_check = await ac.get(f"/sheep/{sheep_id}")
        assert response_check.status_code == 404





# tests with tokens

# create sheep
@pytest.mark.asyncio
async def test_create_sheep_with_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        with SessionLocal() as db:
            from models.sheep import Sheep
            from models.farm_inventory import FarmInventory
            from models.veterinarian import Veterinarian
            from models.farmer import Farmer
            from models.farm import Farm

            # delete data in order of dependency
            db.query(Sheep).delete()
            db.query(FarmInventory).delete()
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = Farm(name="Test Farm", location="Test Land")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            farmer = Farmer(
                name="Test Farmer",
                email="farmer@example.com",
                password=hash_password("securepassword"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()

        # log in as farmer to get token
        login_response = await ac.post("/auth/login", json={
            "email": "farmer@example.com",
            "password": "securepassword"
        })

        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # call POST /sheep/ using Authorization header
        sheep_payload = {
            "birth_date": "2023-04-01",
            "farm_id": farm_id,
            "milk_production": 4.2,
            "feeding_hay": 1.5,
            "feeding_feed": 0.5,
            "gender": "femea",
            "status": "borrego"
        }

        response = await ac.post(
            "/sheep/",
            json=sheep_payload,
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["farm_id"] == farm_id
        assert data["status"] == "borrego"




# put sheep (update)
@pytest.mark.asyncio
async def test_update_sheep_with_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        # setup: create farm, user and sheep
        # setup: create farm, user and sheep
        with SessionLocal() as db:
            db.query(Sheep).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = Farm(name="Test Farm", location="Test Land")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            # create farmer
            farmer = Farmer(
                name="Test Farmer",
                email="farmer@test.com",
                password=hash_password("123456"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            # create sheep
            sheep = Sheep(
                birth_date="2023-04-01",
                farm_id=farm_id,
                milk_production=4.2,
                feeding_hay=1.5,
                feeding_feed=0.5,
                gender="femea",
                status="borrego"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

        # login to get JWT
        login_response = await ac.post("/auth/login", json={"email": "farmer@test.com", "password": "123456"})
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # update sheep
        updated_data = {
            "birth_date": "2023-04-01",
            "farm_id": farm_id,
            "milk_production": 6.1,
            "feeding_hay": 2.0,
            "feeding_feed": 1.0,
            "gender": "femea",
            "status": "ovelha"
        }

        response = await ac.put(
            f"/sheep/{sheep_id}",
            json=updated_data,
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert response.json()["milk_production"] == 6.1
        assert response.json()["status"] == "ovelha"




# get list of sheep
@pytest.mark.asyncio
async def test_list_sheep_with_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # setup
        with SessionLocal() as db:
            db.query(Sheep).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = Farm(name="Test Farm", location="Test Location")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            # create farmer linked to farm
            farmer = Farmer(
                name="Test Farmer",
                email="farmer@test.com",
                password=hash_password("123456"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            # Create two sheep
            sheep1 = Sheep(
                birth_date="2023-01-01",
                farm_id=farm_id,
                milk_production=4.5,
                feeding_hay=1.2,
                feeding_feed=0.3,
                gender="femea",
                status="ovelha"
            )
            sheep2 = Sheep(
                birth_date="2022-05-15",
                farm_id=farm_id,
                milk_production=3.8,
                feeding_hay=1.0,
                feeding_feed=0.4,
                gender="macho",
                status="reprodutor"
            )
            db.add_all([sheep1, sheep2])
            db.commit()

        # login to get token
        login_response = await ac.post("/auth/login", json={"email": "farmer@test.com", "password": "123456"})
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # request list of sheep
        response = await ac.get("/sheep/", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        assert data[0]["status"] in ["ovelha", "reprodutor"]


