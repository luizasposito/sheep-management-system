import pytest
from httpx import AsyncClient, ASGITransport
from database import SessionLocal
from models.farmer import Farmer
from models.veterinarian import Veterinarian
from models.farm import Farm
from utils import hash_password
from main import app
from sqlalchemy import text

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

def create_test_farm():
    with SessionLocal() as db:
        farm = Farm(name="Test Farm", location="Test Location")
        db.add(farm)
        db.commit()
        db.refresh(farm)
        return farm.id

def create_test_farmer(email="farmer@test.com", password="farmer123", farm_id=None):
    if not farm_id:
        farm_id = create_test_farm()
    with SessionLocal() as db:
        hashed_pw = hash_password(password)
        farmer = Farmer(
            name="Test Farmer",
            email=email,
            password=hashed_pw,
            farm_id=farm_id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
        return farmer

def create_test_veterinarian(email="vet@test.com", password="vet123"):
    farm_id = create_test_farm()
    farmer = create_test_farmer(farm_id=farm_id)
    with SessionLocal() as db:
        hashed_pw = hash_password(password)
        vet = Veterinarian(
            name="Test Veterinarian",
            email=email,
            password=hashed_pw,
            farm_id=farm_id,
            farmer_id=farmer.id
        )
        db.add(vet)
        db.commit()
        db.refresh(vet)
        return vet

@pytest.mark.asyncio
async def test_farmer_login_and_me_logout():
    reset_database()
    farmer = create_test_farmer()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_resp = await ac.post("/auth/login", json={"email": farmer.email, "password": "farmer123"})
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

        me_resp = await ac.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        data = me_resp.json()
        assert data["email"] == farmer.email
        assert data["role"] == "farmer"

        logout_resp = await ac.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert logout_resp.status_code == 200
        assert logout_resp.json()["message"] == "Logout realizado com sucesso"

@pytest.mark.asyncio
async def test_veterinarian_login_and_me_logout():
    reset_database()
    vet = create_test_veterinarian()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_resp = await ac.post("/auth/login", json={"email": vet.email, "password": "vet123"})
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]

        me_resp = await ac.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        data = me_resp.json()
        assert data["email"] == vet.email
        assert data["role"] == "veterinarian"

        logout_resp = await ac.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert logout_resp.status_code == 200
        assert logout_resp.json()["message"] == "Logout realizado com sucesso"

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    reset_database()
    create_test_farmer()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_resp = await ac.post("/auth/login", json={"email": "farmer@test.com", "password": "wrongpass"})
        assert login_resp.status_code == 401

        login_resp = await ac.post("/auth/login", json={"email": "noone@test.com", "password": "whatever"})
        assert login_resp.status_code == 401
