
import pytest
from httpx import AsyncClient
from httpx._transports.asgi import ASGITransport
from sqlalchemy import text
from database import SessionLocal
from models.farm import Farm
from models.farmer import Farmer
from models.sensor import Sensor
from main import app
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


def create_test_user():
    with SessionLocal() as db:
        farm = Farm(name="Sensor Farm", location="Field")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Sensor Farmer",
            email="sensor@test.com",
            password=hash_password("sensor123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
        return farm.id

@pytest.mark.asyncio
async def test_create_sensor():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sensor@test.com", "password": "sensor123"})
        token = login.json()["access_token"]

        response = await ac.post("/sensor/", json={
            "name": "Temperature",
            "min_value": 10.5,
            "max_value": 30.0,
            "current_value": 22.0
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Temperature"
        assert "id" in data

@pytest.mark.asyncio
async def test_get_sensor_by_id():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sensor = Sensor(
            name="Humidity",
            min_value=20.0,
            max_value=80.0,
            current_value=55.5,
            farm_id=farm_id
        )
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
        sensor_id = sensor.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sensor@test.com", "password": "sensor123"})
        token = login.json()["access_token"]

        response = await ac.get(f"/sensor/{sensor_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["id"] == sensor_id

@pytest.mark.asyncio
async def test_list_all_sensors():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        db.add(Sensor(
            name="PH",
            min_value=5.5,
            max_value=7.5,
            current_value=6.0,
            farm_id=farm_id
        ))
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sensor@test.com", "password": "sensor123"})
        token = login.json()["access_token"]

        response = await ac.get("/sensor/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0

@pytest.mark.asyncio
async def test_update_sensor():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sensor = Sensor(
            name="CO2",
            min_value=200.0,
            max_value=800.0,
            current_value=350.0,
            farm_id=farm_id
        )
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
        sensor_id = sensor.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sensor@test.com", "password": "sensor123"})
        token = login.json()["access_token"]

        response = await ac.put(f"/sensor/{sensor_id}", json={
            "name": "CO2 Sensor",
            "current_value": 400.0
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json()["name"] == "CO2 Sensor"
        assert response.json()["current_value"] == 400.0

@pytest.mark.asyncio
async def test_delete_sensor():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sensor = Sensor(
            name="Ammonia",
            min_value=100.0,
            max_value=1000.0,
            current_value=500.0,
            farm_id=farm_id
        )
        db.add(sensor)
        db.commit()
        db.refresh(sensor)
        sensor_id = sensor.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sensor@test.com", "password": "sensor123"})
        token = login.json()["access_token"]

        response = await ac.delete(f"/sensor/{sensor_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 204
