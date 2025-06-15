import pytest
from httpx import AsyncClient
from httpx import ASGITransport
from database import SessionLocal
from main import app
from farm.model_farm import Farm
from farmer.model_farmer import Farmer
from sheepgroup.model_sheepgroup import SheepGroup
from utils import hash_password
from sqlalchemy import text

@pytest.fixture
def create_user_and_token():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))  # primeiro as dependentes
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


        # Criar fazenda e fazendeiro
        farm = Farm(name="Test Farm", location="Valley")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Test Farmer",
            email="test@example.com",
            password=hash_password("test123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")

    async def _login():
        response = await client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })
        assert response.status_code == 200
        return client, response.json()["access_token"]

    return _login


@pytest.mark.asyncio
async def test_create_sheep_group(create_user_and_token):
    client, token = await create_user_and_token()

    response = await client.post(
        "/sheep-group",
        json={"name": "Lactating Sheep", "description": "Group of high milk yield sheep"},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Lactating Sheep"
    assert data["description"] == "Group of high milk yield sheep"


@pytest.mark.asyncio
async def test_get_sheep_groups(create_user_and_token):
    client, token = await create_user_and_token()

    # Criar grupo antes de buscar
    await client.post("/sheep-group", json={
        "name": "Test Group", "description": "Some sheep"
    }, headers={"Authorization": f"Bearer {token}"})

    response = await client.get("/sheep-group", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert any(g["name"] == "Test Group" for g in response.json())


@pytest.mark.asyncio
async def test_get_sheep_group_by_id(create_user_and_token):
    client, token = await create_user_and_token()

    # Criar grupo antes de buscar
    res = await client.post("/sheep-group", json={
        "name": "Group X", "description": "Description X"
    }, headers={"Authorization": f"Bearer {token}"})
    group_id = res.json()["id"]

    response = await client.get(f"/sheep-group/{group_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["name"] == "Group X"


@pytest.mark.asyncio
async def test_update_sheep_group(create_user_and_token):
    client, token = await create_user_and_token()

    res = await client.post("/sheep-group", json={
        "name": "Old Group", "description": "Old Desc"
    }, headers={"Authorization": f"Bearer {token}"})
    group_id = res.json()["id"]

    response = await client.put(f"/sheep-group/{group_id}", json={
        "name": "New Group", "description": "New Desc"
    }, headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["name"] == "New Group"


@pytest.mark.asyncio
async def test_delete_sheep_group(create_user_and_token):
    client, token = await create_user_and_token()

    res = await client.post("/sheep-group", json={
        "name": "To Delete", "description": "Bye"
    }, headers={"Authorization": f"Bearer {token}"})
    group_id = res.json()["id"]

    delete_res = await client.delete(f"/sheep-group/{group_id}", headers={"Authorization": f"Bearer {token}"})
    assert delete_res.status_code == 200

    get_res = await client.get(f"/sheep-group/{group_id}", headers={"Authorization": f"Bearer {token}"})
    assert get_res.status_code == 404
