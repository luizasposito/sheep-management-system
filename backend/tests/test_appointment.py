
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from database import SessionLocal
from farm.model_farm import Farm
from farmer.model_farmer import Farmer
from sheep.model_sheep import Sheep
from veterinarian.model_veterinarian import Veterinarian
from utils import hash_password
from sqlalchemy import text
from main import app

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

def create_test_user_and_data():
    with SessionLocal() as db:
        farm = Farm(name="Test Farm", location="Test Land")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Farmer Test",
            email="test@app.com",
            password=hash_password("test123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        vet = Veterinarian(
            name="Vet Test",
            email="vet@app.com",
            password=hash_password("vet123"),
            farm_id=farm.id,
            farmer_id=farmer.id
        )
        db.add(vet)

        sheep = Sheep(
            birth_date="2023-01-01",
            farm_id=farm.id,
            feeding_hay=10.0,
            feeding_feed=15.0,
            gender="Fêmea"
        )
        db.add(sheep)

        db.commit()
        db.refresh(vet)
        db.refresh(sheep)
        return farm.id, vet.id, sheep.id


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac



@pytest.mark.asyncio
async def test_create_appointment(client):
    reset_database()
    _, vet_id, sheep_id = create_test_user_and_data()

    login = await client.post("/auth/login", json={"email": "test@app.com", "password": "test123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post("/appointment/", json={
        "sheep_ids": [sheep_id],
        "vet_id": vet_id,
        "motivo": "Checkup",
        "comentarios": "Healthy",
        "date": "2025-05-21T10:00:00"
    }, headers=headers)

    assert response.status_code == 201
    data = response.json()
    assert data["motivo"] == "Checkup"
    assert sheep_id in data["sheep_ids"]


@pytest.mark.asyncio
async def test_list_appointments(client):
    reset_database()
    _, vet_id, sheep_id = create_test_user_and_data()

    login = await client.post("/auth/login", json={"email": "test@app.com", "password": "test123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Cria uma consulta
    await client.post("/appointment/", json={
        "sheep_ids": [sheep_id],
        "vet_id": vet_id,
        "motivo": "Checkup",
        "comentarios": "Healthy",
        "date": "2025-05-21T10:00:00"
    }, headers=headers)

    response = await client.get("/appointment/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


@pytest.mark.asyncio
async def test_get_appointment_by_id(client):
    reset_database()
    _, vet_id, sheep_id = create_test_user_and_data()

    login = await client.post("/auth/login", json={"email": "test@app.com", "password": "test123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Cria uma consulta
    response = await client.post("/appointment/", json={
        "sheep_ids": [sheep_id],
        "vet_id": vet_id,
        "motivo": "Checkup",
        "comentarios": "Healthy",
        "date": "2025-05-21T10:00:00"
    }, headers=headers)
    appointment_id = response.json()["id"]

    response = await client.get(f"/appointment/{appointment_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == appointment_id


@pytest.mark.asyncio
async def test_update_appointment(client):
    reset_database()
    _, vet_id, sheep_id = create_test_user_and_data()

    farmer_login = await client.post("/auth/login", json={"email": "test@app.com", "password": "test123"})
    farmer_token = farmer_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {farmer_token}"}

    response = await client.post("/appointment/", json={
        "sheep_ids": [sheep_id],
        "vet_id": vet_id,
        "motivo": "Checkup",
        "comentarios": "Healthy",
        "date": "2025-05-21T10:00:00"
    }, headers=headers)
    appointment_id = response.json()["id"]

    vet_login = await client.post("/auth/login", json={"email": "vet@app.com", "password": "vet123"})
    vet_token = vet_login.json()["access_token"]
    vet_headers = {"Authorization": f"Bearer {vet_token}"}

    response = await client.patch(f"/appointment/{appointment_id}", json={
        "motivo": "Updated Motivo",
        "comentarios": "New Comments",
        "medications": [
            {"name": "Antibiotic", "dosage": "5mg", "indication": "Infection"},
            {"name": "Vitamin", "dosage": "10ml", "indication": "Supplements"}
        ]
    }, headers=vet_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["motivo"] == "Updated Motivo"
    assert len(data["medications"]) == 2