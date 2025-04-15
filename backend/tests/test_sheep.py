# import testing tools
import pytest
from httpx import AsyncClient, ASGITransport

import sys
import os

# add the backend folder to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# tell pytest this is an async test
@pytest.mark.asyncio
async def test_create_sheep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        # use direct SQL insert with SQLAlchemy
        from database import SessionLocal
        from models.farm import Farm  # ← you'll need to create this model if it doesn't exist

        with SessionLocal() as db:
            db.add(Farm(id=1, name="Test Farm", location="Test Land"))
            db.commit()

        # create a sheep assigned to farm_id=1
        response = await ac.post("/sheep/", json={
            "id": 1,
            "birth_date": "2023-04-01",
            "farm_id": 1,
            "milk_production": 4.2,
            "feeding_hay": 1.5,
            "feeding_feed": 0.5,
            "gender": "femea",
            "status": "borrego"
        })

    assert response.status_code == 200
    assert response.json()["id"] == 1




@pytest.mark.asyncio
async def test_get_all_sheep():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # call the endpoint
        response = await ac.get("/sheep/")

    # check that it returns status code 200 (OK)
    assert response.status_code == 200

    # make sure it sends a list back
    assert isinstance(response.json(), list)

    # make sure at least 1 sheep is there
    assert len(response.json()) >= 1