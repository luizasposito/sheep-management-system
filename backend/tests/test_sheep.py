import pytest
from httpx import AsyncClient, ASGITransport
from database import SessionLocal
from models.sheep import Sheep
from models.farm import Farm
from models.farmer import Farmer
from models.sheep_parentage import SheepParentage
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
async def test_create_sheep():
    reset_database()
    farm_id = create_test_user()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.post("/sheep/", json={
            "birth_date": "2023-05-01",
            "farm_id": farm_id,
            "feeding_hay": 10.0,
            "feeding_feed": 15.0,
            "gender": "Fêmea"
        }, headers={"Authorization": f"Bearer {token}"})

        #assert response.status_code != 404, "POST /sheep/ não existe"
        assert response.status_code == 200
        data = response.json()
        assert data["feeding_hay"] == 10.0
        assert "id" in data


@pytest.mark.asyncio
async def test_get_sheep_by_id():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sheep = Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=7.0,
            gender="Macho"
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)
        sheep_id = sheep.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.get(f"/sheep/{sheep_id}", headers={"Authorization": f"Bearer {token}"})
        
        #assert response.status_code != 404, "GET /sheep/{id} não existe"
        assert response.status_code == 200
        assert response.json()["id"] == sheep_id


@pytest.mark.asyncio
async def test_list_all_sheep():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        db.add(Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=7.0,
            gender="Macho"
        ))
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.get("/sheep/", headers={"Authorization": f"Bearer {token}"})
        
        #assert response.status_code != 404, "GET /sheep/ não existe"
        assert response.status_code == 200
        assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_update_sheep():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sheep = Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=7.0,
            gender="Macho"
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)
        sheep_id = sheep.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.put(f"/sheep/{sheep_id}", json={
            "birth_date": "2023-01-01",
            "feeding_hay": 12.5,
            "feeding_feed": 7.0,
            "gender": "Fêmea",
            "farm_id": farm_id,
            # optionally group_id, father_id, mother_id
        }, headers={"Authorization": f"Bearer {token}"})

        #assert response.status_code != 404, "PUT /sheep/{id} não existe"
        assert response.status_code == 200
        assert response.json()["feeding_hay"] == 12.5


@pytest.mark.asyncio
async def test_delete_sheep():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sheep = Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=7.0,
            gender="Fêmea"
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)
        sheep_id = sheep.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.delete(f"/sheep/{sheep_id}", headers={"Authorization": f"Bearer {token}"})
        
        #assert response.status_code != 404, "DELETE /sheep/{id} não existe"
        assert response.status_code == 204


@pytest.mark.asyncio
async def test_update_milk_yield():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        sheep = Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=7.0,
            gender="Fêmea"
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)
        sheep_id = sheep.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.patch(f"/sheep/{sheep_id}/milk-yield", json={
            "volume": 4.8,
            "date": "2025-05-15"
        }, headers={"Authorization": f"Bearer {token}"})

        #assert response.status_code != 404, "PATCH /sheep/{id}/milk-yield não existe"
        assert response.status_code == 200
        assert response.json()["milk_production"] == 4.8



@pytest.mark.asyncio
async def test_get_sheep_parents():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        father = Sheep(
            birth_date="2020-01-01",
            farm_id=farm_id,
            feeding_hay=10.0,
            feeding_feed=8.0,
            gender="Macho"
        )
        mother = Sheep(
            birth_date="2021-01-01",
            farm_id=farm_id,
            feeding_hay=9.0,
            feeding_feed=7.0,
            gender="Fêmea"
        )
        db.add_all([father, mother])
        db.commit()
        db.refresh(father)
        db.refresh(mother)

        child = Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=5.0,
            gender="Macho"
        )
        db.add(child)
        db.commit()
        db.refresh(child)

        db.add_all([
            SheepParentage(parent_id=father.id, offspring_id=child.id),
            SheepParentage(parent_id=mother.id, offspring_id=child.id)
        ])
        db.commit()

        sheep_id = child.id
        father_id = father.id
        mother_id = mother.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.get(f"/sheep/{sheep_id}/parents", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        parent_ids = {parent["id"] for parent in data}
        assert father_id in parent_ids
        assert mother_id in parent_ids



@pytest.mark.asyncio
async def test_get_sheep_children():
    reset_database()
    farm_id = create_test_user()

    with SessionLocal() as db:
        parent = Sheep(
            birth_date="2020-01-01",
            farm_id=farm_id,
            feeding_hay=10.0,
            feeding_feed=8.0,
            gender="Macho"
        )
        db.add(parent)
        db.commit()
        db.refresh(parent)

        child1 = Sheep(
            birth_date="2023-01-01",
            farm_id=farm_id,
            feeding_hay=5.0,
            feeding_feed=5.0,
            gender="Fêmea"
        )
        child2 = Sheep(
            birth_date="2023-01-02",
            farm_id=farm_id,
            feeding_hay=6.0,
            feeding_feed=5.5,
            gender="Fêmea"
        )
        db.add_all([child1, child2])
        db.commit()
        db.refresh(child1)
        db.refresh(child2)

        db.add_all([
            SheepParentage(parent_id=parent.id, offspring_id=child1.id),
            SheepParentage(parent_id=parent.id, offspring_id=child2.id)
        ])
        db.commit()

        sheep_id = parent.id
        child1_id = child1.id
        child2_id = child2.id

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login = await ac.post("/auth/login", json={"email": "sheep@test.com", "password": "sheep123"})
        token = login.json()["access_token"]

        response = await ac.get(f"/sheep/{sheep_id}/children", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        child_ids = {child["id"] for child in data}
        assert child1_id in child_ids
        assert child2_id in child_ids