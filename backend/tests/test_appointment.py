import pytest
from httpx import AsyncClient, ASGITransport
from database import SessionLocal
from main import app
from models.farm import Farm
from models.farmer import Farmer
from models.veterinarian import Veterinarian
from models.sheep import Sheep
from models.appointment import Appointment
from utils import hash_password

@pytest.fixture(scope="module")
def event_loop():
    import asyncio
    loop = asyncio.get_event_loop()
    yield loop

@pytest.fixture
def setup_farm_farmer_vet_sheep():
    email_farmer = "farmer@app.com"
    email_vet = "vet@app.com"
    password = "123456"

    with SessionLocal() as db:
        # Limpar dados antigos
        db.query(Appointment).delete()
        db.query(Sheep).delete()
        db.query(Veterinarian).filter(Veterinarian.email == email_vet).delete()
        db.query(Farmer).filter(Farmer.email == email_farmer).delete()
        db.commit()

        # Criar fazenda
        farm = Farm(name="Fazenda Boa", location="Interior")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        # Criar fazendeiro
        farmer = Farmer(
            name="Zé do Campo",
            email=email_farmer,
            password=hash_password(password),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        # Criar veterinário
        vet = Veterinarian(
            name="Dra. Vet",
            email=email_vet,
            password=hash_password(password),
            farm_id=farm.id,
            farmer_id=farmer.id
        )
        db.add(vet)
        db.commit()
        db.refresh(vet)

        # Criar ovelha
        sheep = Sheep(
            birth_date="2023-01-01",
            farm_id=farm.id,
            milk_production=2.3,
            feeding_hay=1.0,
            feeding_feed=0.5,
            gender="female",
            status="sheep"
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)

        return {
            "vet_email": email_vet,
            "vet_password": password,
            "sheep_id": sheep.id,
        }

@pytest.mark.asyncio
async def test_create_and_get_appointments_with_token(setup_farm_farmer_vet_sheep):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Login do veterinário
        login_response = await ac.post("/auth/login", json={
            "email": setup_farm_farmer_vet_sheep["vet_email"],
            "password": setup_farm_farmer_vet_sheep["vet_password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # Criar agendamento
        create_response = await ac.post("/appointment/start", json={
            "sheep_id": setup_farm_farmer_vet_sheep["sheep_id"]
        }, headers={"Authorization": f"Bearer {token}"})

        assert create_response.status_code == 201

        # Obter lista de agendamentos
        response = await ac.get("/appointment/", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        appointments = response.json()
        assert isinstance(appointments, list)
        assert len(appointments) >= 1
        assert "sheep_id" in appointments[0]
