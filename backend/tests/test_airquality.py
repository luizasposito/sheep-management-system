
import pytest
from httpx import AsyncClient, ASGITransport

from database import SessionLocal
from models.farm import Farm
from models.farmer import Farmer
from models.sheep import Sheep
from models.sheepbed import SheepBed
from models.airquality import AirQualityMonitoring
from models.sensortype import SensorType
from utils import hash_password
from datetime import datetime, date

import sys
import os

# add the backend folder to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

@pytest.mark.asyncio
async def test_get_air_quality_monitoring():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with SessionLocal() as db:
            # setup
            db.query(AirQualityMonitoring).delete()
            db.query(SensorType).delete()
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

            # create sensor types
            temp_sensor = SensorType(name="temperatura", unit="°C")
            humidity_sensor = SensorType(name="umidade", unit="%")
            oxygen_sensor = SensorType(name="oxigênio", unit="%")
            db.add_all([temp_sensor, humidity_sensor, oxygen_sensor])
            db.commit()
            db.refresh(temp_sensor)
            db.refresh(humidity_sensor)
            db.refresh(oxygen_sensor)

            # create air quality monitoring values
            aq1 = AirQualityMonitoring(
                farm_id=farm_id,
                sensor_type_id=temp_sensor.id,
                current_value=22.5,
                low_threshold=18.0,
                high_threshold=30.0,
                timestamp=datetime(2025, 4, 21, 12, 0)
            )
            aq2 = AirQualityMonitoring(
                farm_id=farm_id,
                sensor_type_id=humidity_sensor.id,
                current_value=65.0,
                low_threshold=40.0,
                high_threshold=75.0,
                timestamp=datetime(2025, 4, 21, 12, 0)
            )
            aq3 = AirQualityMonitoring(
                farm_id=farm_id,
                sensor_type_id=oxygen_sensor.id,
                current_value=20.9,
                low_threshold=19.5,
                high_threshold=23.0,
                timestamp=datetime(2025, 4, 21, 12, 0)
            )
            db.add_all([aq1, aq2, aq3])
            db.commit()

        # login
        login_response = await ac.post("/auth/login", json={
            "email": "maria@teste.com",
            "password": "123456"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # request air quality monitoring data
        response = await ac.get(
            "/airquality/current",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3

        sensor_names = {d["sensor_type"]["name"] for d in data}
        assert {"temperatura", "umidade", "oxigênio"} == sensor_names
