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



# get consultation by id
@pytest.mark.asyncio
async def test_get_consultation_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with SessionLocal() as db:
            db.query(Consultation).delete()
            db.query(Sheep).delete()
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = Farm(name="Farm B", location="Rural")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            # create farmer
            farmer = Farmer(
                name="Fazendeiro",
                email="fazenda@terra.com",
                password=hash_password("1234"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)
            farmer_id = farmer.id

            # create veterinarian
            vet = Veterinarian(
                name="Dra. Ana",
                email="ana@vet.com",
                password=hash_password("vet123"),
                farm_id=farm_id,
                farmer_id=farmer_id
            )
            db.add(vet)
            db.commit()
            db.refresh(vet)

            # create sheep
            sheep = Sheep(
                birth_date="2023-01-01",
                farm_id=farm_id,
                milk_production=4.0,
                feeding_hay=1.0,
                feeding_feed=0.5,
                gender="femea",
                status="ovelha"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)

            # create consultation
            consultation = Consultation(
                sheep_id=sheep.id,
                vet_id=vet.id,
                diagnosis="Febre",
                treatment="Repouso e hidratação",
                follow_up_date="2023-12-10"
            )
            db.add(consultation)
            db.commit()
            db.refresh(consultation)

        # login as vet
        login_response = await ac.post("/auth/login", json={
            "email": "ana@vet.com",
            "password": "vet123"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # get consultation by id
        response = await ac.get(
            f"/consultation/{consultation.id}",
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == consultation.id
        assert data["diagnosis"] == "Febre"




# post to start consultation
@pytest.mark.asyncio
async def test_start_consultation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        from models.farm_inventory import FarmInventory

        with SessionLocal() as db:
            db.query(Consultation).delete()
            db.query(Sheep).delete()
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.query(FarmInventory).delete()
            db.query(Farm).delete()
            db.commit()

            # create farm
            farm = Farm(name="StartConsult Farm", location="North")
            db.add(farm)
            db.commit()
            db.refresh(farm)
            farm_id = farm.id

            # create farmer
            farmer = Farmer(
                name="Consult Farmer",
                email="cfarmer@test.com",
                password=hash_password("cfpass"),
                farm_id=farm_id
            )
            db.add(farmer)
            db.commit()
            db.refresh(farmer)
            farmer_id = farmer.id

            # create vet
            vet = Veterinarian(
                name="Vet Start",
                email="vetstart@test.com",
                password=hash_password("vetpass"),
                farm_id=farm_id,
                farmer_id=farmer_id
            )
            db.add(vet)
            db.commit()
            db.refresh(vet)

            # Create sheep
            sheep = Sheep(
                birth_date="2023-01-01",
                farm_id=farm_id,
                milk_production=3.0,
                feeding_hay=1.0,
                feeding_feed=0.4,
                gender="femea",
                status="ovelha"
            )
            db.add(sheep)
            db.commit()
            db.refresh(sheep)
            sheep_id = sheep.id

        # Login as vet
        login_response = await ac.post("/auth/login", json={
            "email": "vetstart@test.com",
            "password": "vetpass"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Send POST request to start consultation
        response = await ac.post(
            "/consultation/start",
            json={"sheep_id": sheep_id},
            headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["sheep_id"] == sheep_id
        assert "id" in data
        assert data["diagnosis"] is None
