import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from database import SessionLocal
from main import app
from farm.model_farm import Farm
from utils import hash_password


def reset_database():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep_parentage"))
        db.execute(text("DELETE FROM appointment_sheep"))
        db.execute(text("DELETE FROM medication"))
        db.execute(text("DELETE FROM appointment"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM sensor"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


def create_test_farm():
    with SessionLocal() as db:
        farm = Farm(name="Test Farm", location="Anywhere")
        db.add(farm)
        db.commit()
        db.refresh(farm)
        return farm.id


@pytest.mark.asyncio
async def test_create_farmer():
    reset_database()
    farm_id = create_test_farm()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/farmer/", json={
            "name": "João Teste",
            "email": "joao@test.com",
            "password": "123456",
            "farm_id": farm_id
        })

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "joao@test.com"
        assert "id" in data


@pytest.mark.asyncio
async def test_get_farmer_by_id():
    reset_database()
    farm_id = create_test_farm()

    # Criação direta via banco
    with SessionLocal() as db:
        db.execute(text("INSERT INTO farmer (name, email, password, farm_id) VALUES ('Maria', 'maria@test.com', 'hashedpw', :farm_id)"), {"farm_id": farm_id})
        db.commit()
        farmer_id = db.execute(text("SELECT id FROM farmer WHERE email = 'maria@test.com'")).scalar()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(f"/farmer/{farmer_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "maria@test.com"
        assert data["id"] == farmer_id


@pytest.mark.asyncio
async def test_update_farmer():
    reset_database()
    farm_id = create_test_farm()

    with SessionLocal() as db:
        db.execute(text("INSERT INTO farmer (name, email, password, farm_id) VALUES ('Ana', 'ana@test.com', 'hashedpw', :farm_id)"), {"farm_id": farm_id})
        db.commit()
        farmer_id = db.execute(text("SELECT id FROM farmer WHERE email = 'ana@test.com'")).scalar()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        updated_data = {
            "name": "Ana Atualizada",
            "email": "ana_nova@test.com",
            "password": "nova123",
            "farm_id": farm_id
        }
        response = await ac.put(f"/farmer/{farmer_id}", json=updated_data)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Ana Atualizada"
        assert data["email"] == "ana_nova@test.com"