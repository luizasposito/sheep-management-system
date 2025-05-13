import pytest
from httpx import AsyncClient, ASGITransport
from database import SessionLocal
from models.sheep import Sheep
from models.farm import Farm
from models.farmer import Farmer
from models.milk_production import MilkProduction
from utils import hash_password
from sqlalchemy import text
from main import app


def reset_database():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


def create_test_user():
    """Cria fazenda + fazendeiro no banco e retorna (farm_id, credentials)"""
    with SessionLocal() as db:
        farm = Farm(name="Sheep Farm", location="Pasture")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Sheep Farmer",
            email="sheep@test.com",
            password=hash_password("sheep123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
        return farm.id


@pytest.mark.asyncio
async def test_create_sheep_with_token():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login
        login_response = await ac.post("/auth/login", json={
            "email": "sheep@test.com",
            "password": "sheep123"
        })
        token = login_response.json()["access_token"]

        # Criar ovelha
        response = await ac.post("/sheep/", json={
            "birth_date": "2023-05-01",
            "farm_id": farm_id,
            "feeding_hay": 10.0,
            "feeding_feed": 15.0,
            "gender": "female",
            "status": "healthy"
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["birth_date"] == "2023-05-01"
        assert data["feeding_hay"] == 10.0
        assert data["feeding_feed"] == 15.0
        assert data["gender"] == "female"
        assert data["status"] == "healthy"
        assert "id" in data


@pytest.mark.asyncio
async def test_update_milk_yield_with_token():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login
        login_response = await ac.post("/auth/login", json={
            "email": "sheep@test.com",
            "password": "sheep123"
        })
        token = login_response.json()["access_token"]

        # Criar a ovelha
        with SessionLocal() as db:
            sheep = Sheep(
                birth_date="2023-05-01",
                farm_id=farm_id,
                feeding_hay=10.0,
                feeding_feed=15.0,
                gender="female",
                status="healthy"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

        # Atualizar a produção de leite da ovelha
        response = await ac.patch(f"/sheep/{sheep_id}/milk-yield", json={
            "volume": 6.5,  
            "date": "2025-05-10"
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["milk_production"] == 6.5  
        assert data["date"] == "2025-05-10"



@pytest.mark.asyncio
async def test_get_sheep_by_id_with_token():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login
        login_response = await ac.post("/auth/login", json={
            "email": "sheep@test.com",
            "password": "sheep123"
        })
        token = login_response.json()["access_token"]

        # Criação da ovelha
        with SessionLocal() as db:
            sheep = Sheep(
                birth_date="2023-05-01",
                farm_id=farm_id,
                feeding_hay=10.0,
                feeding_feed=15.0,
                gender="female",
                status="healthy"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

        # Obter ovelha por ID
        response = await ac.get(f"/sheep/{sheep_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["id"] == sheep_id


@pytest.mark.asyncio
async def test_update_sheep_with_token():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login
        login_response = await ac.post("/auth/login", json={
            "email": "sheep@test.com",
            "password": "sheep123"
        })
        token = login_response.json()["access_token"]

        # Criação da ovelha
        with SessionLocal() as db:
            sheep = Sheep(
                birth_date="2023-05-01",
                farm_id=farm_id,
                feeding_hay=10.0,
                feeding_feed=15.0,
                gender="female",
                status="healthy"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

        # Atualizar a ovelha
        response = await ac.put(f"/sheep/{sheep_id}", json={
            "birth_date": "2023-05-01",
            "farm_id": farm_id,
            "feeding_hay": 12.0,
            "feeding_feed": 18.0,
            "gender": "female",
            "status": "healthy"
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json()["feeding_hay"] == 12.0
        assert response.json()["feeding_feed"] == 18.0


@pytest.mark.asyncio
async def test_delete_sheep_with_token():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login
        login_response = await ac.post("/auth/login", json={
            "email": "sheep@test.com",
            "password": "sheep123"
        })
        token = login_response.json()["access_token"]

        # Criar a ovelha
        with SessionLocal() as db:
            sheep = Sheep(
                birth_date="2023-05-01",
                farm_id=farm_id,
                feeding_hay=10.0,
                feeding_feed=15.0,
                gender="female",
                status="healthy"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

        # Deletar ovelha
        response = await ac.delete(f"/sheep/{sheep_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 204