import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from database import SessionLocal
from models.farm import Farm
from models.farmer import Farmer
from models.veterinarian import Veterinarian
from models.sheep import Sheep
from models.consultation import Consultation
from utils import hash_password


# get all consultations
@pytest.mark.asyncio
async def test_get_consultations():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with SessionLocal() as db:
            # Clean database
            db.query(Consultation).delete()
            db.query(Sheep).delete()
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # Create farm
            farm = Farm(name="Consultation Farm", location="Countryside")
            db.add(farm)
            db.commit()
            db.refresh(farm)

            # Create farmer
            farmer = Farmer(
                name="Farmer Joe",
                email="joe@farm.com",
                password=hash_password("joepass"),
                farm_id=farm.id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)

            # Create vet
            vet = Veterinarian(
                name="Dr. Vet",
                email="vet@clinic.com",
                password=hash_password("vetpass"),
                farm_id=farm.id,
                farmer_id=farmer.id
            )
            db.add(vet)
            db.commit()
            db.refresh(vet)

            # Create sheep
            sheep = Sheep(
                birth_date="2023-01-01",
                farm_id=farm.id,
                milk_production=2.5,
                feeding_hay=1.0,
                feeding_feed=0.5,
                gender="femea",
                status="ovelha"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)

            # Create consultation
            consultation = Consultation(
                sheep_id=sheep.id,
                vet_id=vet.id,
                diagnosis="Infection",
                treatment="Antibiotics",
                follow_up_date="2023-12-01"
            )
            db.add(consultation)
            db.commit()

        # Login as vet
        login_response = await ac.post("/auth/login", json={
            "email": "vet@clinic.com",
            "password": "vetpass"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Access GET /consultations
        response = await ac.get("/consultation/", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 1
        assert "diagnosis" in response.json()[0]