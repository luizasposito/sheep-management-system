import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from main import app
from database import SessionLocal
from models.farm import Farm
from models.farmer import Farmer
from utils import hash_password

def reset_database():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep_parentage"))
        db.execute(text("DELETE FROM appointment_sheep"))
        db.execute(text("DELETE FROM medication"))
        db.execute(text("DELETE FROM appointment"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM sensor"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


def create_test_farmer(email="inventory@test.com", password="123456"):
    with SessionLocal() as db:
        farm = Farm(name="Test Inventory Farm", location="Somewhere")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Inventory Tester",
            email=email,
            password=hash_password(password),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        return farmer, password


async def get_authenticated_client(email="inventory@test.com", password="123456"):
    transport = ASGITransport(app=app)
    ac = AsyncClient(transport=transport, base_url="http://test")
    login_resp = await ac.post("/auth/login", json={"email": email, "password": password})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return ac, headers


@pytest.mark.asyncio
async def test_create_inventory_item():
    reset_database()
    farmer, password = create_test_farmer()
    ac, headers = await get_authenticated_client(farmer.email, password)

    item_data = {
        "item_name": "Ração Premium",
        "quantity": 20,
        "unit": "kg",
        "consumption_rate": 2.5,
        "category": "Alimentação"
    }

    resp = await ac.post("/inventory/", json=item_data, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["item_name"] == "Ração Premium"
    assert "id" in data

    await ac.aclose()


@pytest.mark.asyncio
async def test_get_inventory_items():
    reset_database()
    farmer, password = create_test_farmer()
    ac, headers = await get_authenticated_client(farmer.email, password)

    # Criar item
    await ac.post("/inventory/", json={
        "item_name": "Feno",
        "quantity": 100,
        "unit": "kg",
        "consumption_rate": 5.0,
        "category": "Alimentação"
    }, headers=headers)

    resp = await ac.get("/inventory/", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["item_name"] == "Feno"

    await ac.aclose()


@pytest.mark.asyncio
async def test_get_inventory_item_by_id():
    reset_database()
    farmer, password = create_test_farmer()
    ac, headers = await get_authenticated_client(farmer.email, password)

    post = await ac.post("/inventory/", json={
        "item_name": "Sal Mineral",
        "quantity": 5,
        "unit": "sacos",
        "consumption_rate": 0.8,
        "category": "Suplemento"
    }, headers=headers)

    item_id = post.json()["id"]

    get_resp = await ac.get(f"/inventory/{item_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["item_name"] == "Sal Mineral"

    await ac.aclose()


@pytest.mark.asyncio
async def test_update_inventory_item():
    reset_database()
    farmer, password = create_test_farmer()
    ac, headers = await get_authenticated_client(farmer.email, password)

    post = await ac.post("/inventory/", json={
        "item_name": "Vacina A",
        "quantity": 10,
        "unit": "doses",
        "consumption_rate": 1.0,
        "category": "Medicamento"
    }, headers=headers)

    item_id = post.json()["id"]

    updated_data = {
        "item_name": "Vacina A",
        "quantity": 15,
        "unit": "ml",
        "consumption_rate": 1.2,
        "category": "Medicamento"
    }

    put_resp = await ac.put(f"/inventory/{item_id}", json=updated_data, headers=headers)
    assert put_resp.status_code == 200
    assert put_resp.json()["quantity"] == 15
    assert put_resp.json()["unit"] == "ml"

    await ac.aclose()


@pytest.mark.asyncio
async def test_delete_inventory_item():
    reset_database()
    farmer, password = create_test_farmer()
    ac, headers = await get_authenticated_client(farmer.email, password)

    post = await ac.post("/inventory/", json={
        "item_name": "Vacina B",
        "quantity": 3,
        "unit": "ampolas",
        "consumption_rate": 0.5,
        "category": "Medicamento"
    }, headers=headers)

    item_id = post.json()["id"]

    delete_resp = await ac.delete(f"/inventory/{item_id}", headers=headers)
    assert delete_resp.status_code == 204

    # Confirmar remoção
    get_resp = await ac.get(f"/inventory/{item_id}", headers=headers)
    assert get_resp.status_code == 404

    await ac.aclose()
