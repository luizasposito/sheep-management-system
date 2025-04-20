import pytest
from httpx import AsyncClient, ASGITransport
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

from database import SessionLocal
from models.farm import Farm
from models.farm_inventory import FarmInventory
from models.farmer import Farmer
from models.veterinarian import Veterinarian
from utils import create_access_token
from utils import hash_password


# post item in inventory
@pytest.mark.asyncio
async def test_create_inventory_item():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        with SessionLocal() as db:
            db.query(FarmInventory).delete()
            db.commit()

            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Inventory Farm", location="Somewhere")
                db.add(farm)
                db.commit()
                db.refresh(farm)

            farm_id = farm.id

        # create inventory item
        response = await ac.post("/inventory/", json={
            "farm_id": farm_id,
            "item_name": "Feno",
            "quantity": 100,
            "unit": "kg",
            "consumption_rate": 5.5
        })

        assert response.status_code == 200
        assert response.json()["item_name"] == "Feno"
        assert response.json()["quantity"] == 100



# get items from inventory
@pytest.mark.asyncio
async def test_get_inventory_items():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Act
        response = await ac.get("/inventory/")

        # Assert
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1
        assert "item_name" in response.json()[0]




# get item by id from inventory
@pytest.mark.asyncio
async def test_get_inventory_item_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # create an inventory item

        with SessionLocal() as db:
            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Inventory Farm", location="Somewhere")
                db.add(farm)
                db.commit()
                db.refresh(farm)
            
            farm_id = farm.id

            # create new item
            new_item = FarmInventory(
                farm_id=farm_id,
                item_name="Feno",
                quantity=100,
                unit="kg",
                consumption_rate=5.5
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)

            # save the ID for later
            item_id = new_item.id

        # send GET request to fetch the item
        response = await ac.get(f"/inventory/{item_id}")

        # check the response and if it contains the correct data
        assert response.status_code == 200
        assert response.json()["id"] == item_id
        assert response.json()["item_name"] == "Feno"
        assert response.json()["quantity"] == 100





# update inventory item by id
@pytest.mark.asyncio
async def test_update_inventory_item():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # create an inventory item
        with SessionLocal() as db:
            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Inventory Farm", location="Somewhere")
                db.add(farm)
                db.commit()
                db.refresh(farm)
            
            farm_id = farm.id

            # create new inventory item
            new_item = FarmInventory(
                farm_id=farm_id,
                item_name="Feno",
                quantity=100,
                unit="kg",
                consumption_rate=5.5
            )
            db.add(new_item)
            db.commit()
            db.refresh(new_item)

            # save the ID for later 
            item_id = new_item.id

        # send PUT request to update the inventory item
        response = await ac.put(f"/inventory/{item_id}", json={
            "farm_id": farm_id,
            "item_name": "Feno",
            "quantity": 150,
            "unit": "kg",
            "consumption_rate": 5.5
        })

        # check that the updated quantity is reflected
        assert response.status_code == 200
        assert response.json()["id"] == item_id
        assert response.json()["quantity"] == 150




# delete inventory item by id
@pytest.mark.asyncio
async def test_delete_inventory_item():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        with SessionLocal() as db:
            farm = db.query(Farm).first()
            if not farm:
                farm = Farm(name="Inventory Farm", location="Somewhere")
                db.add(farm)
                db.commit()
                db.refresh(farm)
            
            farm_id = farm.id

            # create inventory item to delete
            item = FarmInventory(
                farm_id=farm_id,
                item_name="To Be Deleted",
                quantity=10,
                unit="kg",
                consumption_rate=1.0
            )
            db.add(item)
            db.commit()
            db.refresh(item)

            item_id = item.id

        # send DELETE request
        response = await ac.delete(f"/inventory/{item_id}")

        assert response.status_code == 204

        # confirm it's deleted
        get_response = await ac.get(f"/inventory/{item_id}")
        assert get_response.status_code == 404




# tests with tokens

# create item with token
@pytest.mark.asyncio
async def test_create_inventory_item_with_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        with SessionLocal() as db:
            db.query(FarmInventory).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm + farmer
            farm = Farm(name="Farm Inventory Test", location="Someplace")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            farmer = Farmer(
                name="Inventory Farmer",
                email="inventory@farm.com",
                password=hash_password("123456"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

        # login para obter o token
        login_response = await ac.post("/auth/login", json={
            "email": "inventory@farm.com",
            "password": "123456"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # criar item com token
        response = await ac.post("/inventory/", json={
            "farm_id": farm_id,
            "item_name": "Feno",
            "quantity": 100,
            "unit": "kg",
            "consumption_rate": 4.5
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["item_name"] == "Feno"
        assert data["quantity"] == 100
        assert data["unit"] == "kg"
        assert data["farm_id"] == farm_id