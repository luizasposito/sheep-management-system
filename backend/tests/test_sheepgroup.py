
import pytest
from httpx import AsyncClient, ASGITransport
from database import SessionLocal
from models.sheep import Sheep
from models.farm import Farm
from models.farmer import Farmer
from models.sheep_group import SheepGroup
from utils import hash_password
from sqlalchemy import text
from main import app


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
        farm = Farm(name="Sheep Farm", location="Pasture")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Sheep Farmer",
            email="sheep@test.com",
            password=hash_password("sheep123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)
        return farm.id


@pytest.mark.asyncio
async def test_create_sheep_group():
    reset_database()
    farm_id = create_test_user()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.post("/sheep-group/", json={
            "name": "Grupo Teste",
            "description": "Descrição teste",
            "sheep_ids": []
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Grupo Teste"
        assert data["description"] == "Descrição teste"
        assert "id" in data
        assert data["farm_id"] == farm_id


@pytest.mark.asyncio
async def test_get_sheep_group_by_id():
    reset_database()
    farm_id = create_test_user()

    # Criar grupo direto no DB
    with SessionLocal() as db:
        group = SheepGroup(name="GrupoDB", description="descrição", farm_id=farm_id)
        db.add(group)
        db.commit()
        db.refresh(group)
        group_id = group.id

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.get(f"/sheep-group/{group_id}", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == group_id
        assert data["name"] == "GrupoDB"


@pytest.mark.asyncio
async def test_update_sheep_group():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        group = SheepGroup(name="OldName", description="OldDesc", farm_id=farm_id)
        db.add(group)
        db.commit()
        db.refresh(group)
        group_id = group.id

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.put(f"/sheep-group/{group_id}", json={
            "name": "NewName",
            "description": "NewDesc",
            "sheep_ids": []
        }, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "NewName"
        assert data["description"] == "NewDesc"


@pytest.mark.asyncio
async def test_delete_sheep_group():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        group = SheepGroup(name="DeleteMe", description="desc", farm_id=farm_id)
        db.add(group)
        db.commit()
        db.refresh(group)
        group_id = group.id

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.delete(f"/sheep-group/{group_id}", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        assert response.json() == {"message": "Sheep group deleted successfully"}


@pytest.mark.asyncio
async def test_get_sheep_groups_list():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        groups = [
            SheepGroup(name="Group1", description="desc1", farm_id=farm_id),
            SheepGroup(name="Group2", description="desc2", farm_id=farm_id)
        ]
        db.add_all(groups)
        db.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.get("/sheep-group/", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        names = [g["name"] for g in data]
        assert "Group1" in names and "Group2" in names
