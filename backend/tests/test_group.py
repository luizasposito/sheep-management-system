
import pytest
from httpx import AsyncClient
from httpx import ASGITransport
from database import SessionLocal
from main import app
from models.farm import Farm
from models.farmer import Farmer
from models.sheep_group import SheepGroup
from utils import hash_password

@pytest.mark.asyncio
async def test_create_sheep_group():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with SessionLocal() as db:
            db.query(SheepGroup).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm and farmer
            farm = Farm(name="Group Farm", location="Hills")
            db.add(farm)
            db.commit()
            db.refresh(farm)

            farmer = Farmer(
                name="Group Farmer",
                email="group@test.com",
                password=hash_password("group123"),
                farm_id=farm.id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

        # login
        login_response = await ac.post("/auth/login", json={
            "email": "group@test.com",
            "password": "group123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # POST sheep-group
        response = await ac.post(
            "/sheep-group",
            json={"name": "Lactating Sheep", "description": "Group of high milk yield sheep"},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Lactating Sheep"
        assert data["description"] == "Group of high milk yield sheep"
        assert "id" in data
        assert "farm_id" in data
