
import pytest
from httpx import AsyncClient, ASGITransport
import sys
import os

# add backend folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


# post farmer
@pytest.mark.asyncio
async def test_create_farmer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        from database import SessionLocal
        from models.farm import Farm
        from models.farmer import Farmer

        # insert a farm
        with SessionLocal() as db:
            db.query(Farmer).delete()
            db.commit()

            farm = db.query(Farm).filter_by(name="FarmerTest Farm").first()
            if not farm:
                farm = Farm(name="FarmerTest Farm", location="Somewhere")
                db.add(farm)
                db.commit()
                db.refresh(farm)

        # create a farmer
        response = await ac.post("/farmer/", json={
            "name": "Test Farmer",
            "email": "farmer@example.com",
            "password": "securepassword",
            "farm_id": farm.id
        })

    # Check response
    assert response.status_code == 200
    assert response.json()["email"] == "farmer@example.com"
