import pytest
from httpx import AsyncClient
from httpx import ASGITransport
from database import SessionLocal
from main import app
from models.farm import Farm
from models.farmer import Farmer
from utils import hash_password
from sqlalchemy import text

@pytest.fixture
def create_user_and_token():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM sensor"))
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

        farm = Farm(name="Test Farm", location="Valley")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Test Farmer",
            email="test@example.com",
            password=hash_password("test123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")

    async def _login():
        response = await client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })
        assert response.status_code == 200
        return client, response.json()["access_token"]

    return _login


@pytest.mark.asyncio
async def test_create_sensor(create_user_and_token):
    client, token = await create_user_and_token()

    response = await client.post("/sensor/", json={  # Corrigido de "/sensor/" para "/sensor"
        "name": "Temperature Sensor",
        "min_value": 0.0,
        "max_value": 100.0,
        "current_value": 23.5,
        "unit": "°C"
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Temperature Sensor"
    assert data["current_value"] == 23.5
    assert data["unit"] == "°C"


@pytest.mark.asyncio
async def test_get_sensors(create_user_and_token):
    client, token = await create_user_and_token()

    # Cria o sensor
    await client.post("/sensor", json={  # Corrigido de "/sensor/" para "/sensor"
        "name": "Humidity Sensor",
        "min_value": 10.0,
        "max_value": 90.0,
        "current_value": 45.0,
        "unit": "%"
    }, headers={"Authorization": f"Bearer {token}"})

    response = await client.get("/sensor/", headers={"Authorization": f"Bearer {token}"})  # Corrigido de "/sensor/" para "/sensor"
    assert response.status_code == 200
    assert any(s["name"] == "Humidity Sensor" for s in response.json())
