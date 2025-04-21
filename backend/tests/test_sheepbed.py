
import pytest
from httpx import AsyncClient, ASGITransport

from database import SessionLocal
from models.farm import Farm
from models.farmer import Farmer
from models.sheep import Sheep
from models.sheepbed import SheepBed
from utils import hash_password
from datetime import datetime, date

import sys
import os

# add the backend folder to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


# get sheep beds
@pytest.mark.asyncio
async def test_get_sheep_beds():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with SessionLocal() as db:
            # setup
            db.query(SheepBed).delete()
            db.query(Sheep).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = Farm(name="Fazenda Teste", location="Sul")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            # create farmer
            farmer = Farmer(
                name="Maria",
                email="maria@teste.com",
                password=hash_password("123456"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            # create sheep
            sheep = Sheep(
                birth_date=date(2023, 1, 10),
                farm_id=farm_id,
                milk_production=4.5,
                feeding_hay=2.0,
                feeding_feed=1.0,
                gender="femea",
                status="saudável"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

            # create sheep bed
            bed = SheepBed(
                sheep_id=sheep_id,
                location="Estábulo 1",
                last_cleaned=datetime(2024, 4, 10, 8, 0),
                cleaning_interval_days=5
            )
            db.add(bed)
            db.commit()
            db.refresh(bed)

        # login
        login_response = await ac.post("/auth/login", json={
            "email": "maria@teste.com",
            "password": "123456"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # get all sheep beds
        response = await ac.get(
            "/sheepbed/",  # Aqui usamos o endpoint para pegar todas as camas
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        beds = response.json()
        assert isinstance(beds, list)
        assert len(beds) > 0
        assert beds[0]["sheep_id"] == sheep_id
        assert "location" in beds[0]
        assert "last_cleaned" in beds[0]


        