import pytest
from httpx import AsyncClient, ASGITransport
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app


# post item in inventory
@pytest.mark.asyncio
async def test_create_inventory_item():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from database import SessionLocal
        from models.farm import Farm
        from models.farm_inventory import FarmInventory

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
        from database import SessionLocal
        from models.farm import Farm
        from models.farm_inventory import FarmInventory

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