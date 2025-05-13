import pytest
from httpx import AsyncClient, ASGITransport
import sys, os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

from database import SessionLocal
from models.farm import Farm
from models.farm_inventory import FarmInventory
from models.farmer import Farmer
from utils import hash_password

@pytest.fixture(scope="module")
def event_loop():
    import asyncio
    loop = asyncio.get_event_loop()
    yield loop

@pytest.fixture
def setup_farm_farmer_and_token():
    email = "farmer@test.com"
    password = "123456"

    with SessionLocal() as db:
        # Deletar farmer se já existir (para evitar conflito de email único)
        existing_farmer = db.query(Farmer).filter(Farmer.email == email).first()
        if existing_farmer:
            db.delete(existing_farmer)
            db.commit()

        # Cria fazenda (se já existir uma igual, não tem problema duplicar fazenda)
        farm = Farm(name="Test Farm", location="Someplace")
        db.add(farm)
        db.commit()
        db.refresh(farm)
        farm_id = farm.id

        # Cria farmer associado à fazenda
        farmer = Farmer(
            name="Test Farmer",
            email=email,
            password=hash_password(password),
            farm_id=farm_id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

    return {"farm_id": farm_id, "farmer_email": email, "farmer_password": password}


@pytest.mark.asyncio
async def test_create_inventory_item_with_token(setup_farm_farmer_and_token):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # login e obter token
        login_response = await ac.post("/auth/login", json={
            "email": setup_farm_farmer_and_token["farmer_email"],
            "password": setup_farm_farmer_and_token["farmer_password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # criar item
        response = await ac.post("/inventory/", json={
            "farm_id": setup_farm_farmer_and_token["farm_id"],
            "item_name": "Feno",
            "quantity": 100,
            "unit": "kg",
            "consumption_rate": 5.5
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json()["item_name"] == "Feno"
        assert response.json()["quantity"] == 100

@pytest.mark.asyncio
async def test_get_inventory_items_with_token(setup_farm_farmer_and_token):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # login e obter token
        login_response = await ac.post("/auth/login", json={
            "email": setup_farm_farmer_and_token["farmer_email"],
            "password": setup_farm_farmer_and_token["farmer_password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        response = await ac.get("/inventory/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1

@pytest.mark.asyncio
async def test_get_inventory_item_by_id_with_token(setup_farm_farmer_and_token):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # login e obter token
        login_response = await ac.post("/auth/login", json={
            "email": setup_farm_farmer_and_token["farmer_email"],
            "password": setup_farm_farmer_and_token["farmer_password"]
        })
        token = login_response.json()["access_token"]

        # cria item manualmente
        with SessionLocal() as db:
            item = FarmInventory(
                farm_id=setup_farm_farmer_and_token["farm_id"],
                item_name="Saco de Ração",
                quantity=50,
                unit="kg",
                consumption_rate=2.0
            )
            db.add(item)
            db.commit()
            db.refresh(item)
            item_id = item.id

        response = await ac.get(f"/inventory/{item_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["id"] == item_id

@pytest.mark.asyncio
async def test_update_inventory_item_with_token(setup_farm_farmer_and_token):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": setup_farm_farmer_and_token["farmer_email"],
            "password": setup_farm_farmer_and_token["farmer_password"]
        })
        token = login_response.json()["access_token"]

        # cria item manualmente
        with SessionLocal() as db:
            item = FarmInventory(
                farm_id=setup_farm_farmer_and_token["farm_id"],
                item_name="Bloco Mineral",
                quantity=30,
                unit="unidade",
                consumption_rate=0.5
            )
            db.add(item)
            db.commit()
            db.refresh(item)
            item_id = item.id

        # atualiza o item
        response = await ac.put(f"/inventory/{item_id}", json={
            "farm_id": setup_farm_farmer_and_token["farm_id"],
            "item_name": "Bloco Mineral",
            "quantity": 60,
            "unit": "unidade",
            "consumption_rate": 0.5
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json()["quantity"] == 60

@pytest.mark.asyncio
async def test_delete_inventory_item_with_token(setup_farm_farmer_and_token):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": setup_farm_farmer_and_token["farmer_email"],
            "password": setup_farm_farmer_and_token["farmer_password"]
        })
        token = login_response.json()["access_token"]

        # cria item manualmente
        with SessionLocal() as db:
            item = FarmInventory(
                farm_id=setup_farm_farmer_and_token["farm_id"],
                item_name="Medicamento",
                quantity=20,
                unit="ml",
                consumption_rate=1.0
            )
            db.add(item)
            db.commit()
            db.refresh(item)
            item_id = item.id

        # deleta o item
        response = await ac.delete(f"/inventory/{item_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 204

        # confirma que foi deletado
        get_response = await ac.get(f"/inventory/{item_id}", headers={"Authorization": f"Bearer {token}"})
        assert get_response.status_code == 404
