import pytest
from httpx import AsyncClient, ASGITransport
from datetime import date, timedelta
from database import SessionLocal
from main import app
from models.farm import Farm
from models.farmer import Farmer
from models.sheep import Sheep
from models.milk_production import MilkProduction
from models.sheep_group import SheepGroup
from utils import hash_password
from sqlalchemy import text
from fastapi.testclient import TestClient


def create_test_user_and_farm():
    with SessionLocal() as db:

        farm = Farm(name="Milk Farm", location="Field")
        db.add(farm)
        db.commit()
        db.refresh(farm)

        farmer = Farmer(
            name="Milk Boss",
            email="milk@test.com",
            password=hash_password("milk123"),
            farm_id=farm.id
        )
        db.add(farmer)
        db.commit()
        db.refresh(farmer)

        return farm.id


@pytest.mark.asyncio
async def test_total_today_endpoint():
    
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


    farm_id = create_test_user_and_farm()

    # Criação das ovelhas e produções
    with SessionLocal() as db:
        sheep1 = Sheep(
            birth_date="2023-01-01",
            gender="female",
            status="healthy",
            farm_id=farm_id
        )
        sheep2 = Sheep(
            birth_date="2023-01-02",
            gender="female",
            status="healthy",
            farm_id=farm_id
        )
        db.add_all([sheep1, sheep2])
        db.commit()
        db.refresh(sheep1)
        db.refresh(sheep2)

        today = date.today()
        yesterday = today - timedelta(days=1)

        milk_records = [
            MilkProduction(sheep_id=sheep1.id, date=today, volume=4.0),
            MilkProduction(sheep_id=sheep2.id, date=today, volume=6.0),
            MilkProduction(sheep_id=sheep1.id, date=yesterday, volume=5.0),  # não deve contar
        ]
        db.add_all(milk_records)
        db.commit()

    # Faz login e acessa o endpoint
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/total-today", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        data = response.json()
        assert "total_volume" in data
        assert data["total_volume"] == 10.0
        assert data["date"] == str(today)



@pytest.mark.asyncio
async def test_total_today_by_group_endpoint():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        # Criar grupos
        db.execute(text("INSERT INTO sheep_group (name, farm_id) VALUES ('Grupo A', :fid), ('Grupo B', :fid)"), {"fid": farm_id})
        db.commit()

        group_a = db.execute(text("SELECT * FROM sheep_group WHERE name='Grupo A'")).fetchone()
        group_b = db.execute(text("SELECT * FROM sheep_group WHERE name='Grupo B'")).fetchone()

        # Criar ovelhas
        sheep1 = Sheep(birth_date="2023-01-01", gender="female", status="healthy", farm_id=farm_id, group_id=group_a.id)
        sheep2 = Sheep(birth_date="2023-01-02", gender="female", status="healthy", farm_id=farm_id, group_id=group_a.id)
        sheep3 = Sheep(birth_date="2023-01-03", gender="female", status="healthy", farm_id=farm_id, group_id=group_b.id)

        db.add_all([sheep1, sheep2, sheep3])
        db.commit()
        db.refresh(sheep1)
        db.refresh(sheep2)
        db.refresh(sheep3)

        today = date.today()
        # Produção de leite
        milk_data = [
            MilkProduction(sheep_id=sheep1.id, date=today, volume=4.0),
            MilkProduction(sheep_id=sheep2.id, date=today, volume=6.0),
            MilkProduction(sheep_id=sheep3.id, date=today, volume=8.0)
        ]
        db.add_all(milk_data)
        db.commit()

    # Acessar o endpoint
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/total-today-by-group", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        result = response.json()

        # Esperado:
        # Grupo A: 10.0 (4+6)
        # Grupo B: 8.0
        assert len(result) == 2
        for group in result:
            if group["group_name"] == "Grupo A":
                assert group["total_volume"] == 10.0
            elif group["group_name"] == "Grupo B":
                assert group["total_volume"] == 8.0



@pytest.mark.asyncio
async def test_total_last_7_days_endpoint():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        # Criar grupos
        db.execute(text("INSERT INTO sheep_group (name, farm_id) VALUES ('Grupo A', :fid), ('Grupo B', :fid)"), {"fid": farm_id})
        db.commit()

        group_a = db.execute(text("SELECT * FROM sheep_group WHERE name='Grupo A'")).fetchone()
        group_b = db.execute(text("SELECT * FROM sheep_group WHERE name='Grupo B'")).fetchone()

        # Criar ovelhas
        sheep1 = Sheep(birth_date="2023-01-01", gender="female", status="healthy", farm_id=farm_id, group_id=group_a.id)
        sheep2 = Sheep(birth_date="2023-01-02", gender="female", status="healthy", farm_id=farm_id, group_id=group_a.id)
        sheep3 = Sheep(birth_date="2023-01-03", gender="female", status="healthy", farm_id=farm_id, group_id=group_b.id)

        db.add_all([sheep1, sheep2, sheep3])
        db.commit()
        db.refresh(sheep1)
        db.refresh(sheep2)
        db.refresh(sheep3)

        today = date.today()
        # Criar produções para os últimos 7 dias
        milk_data = [
            MilkProduction(sheep_id=sheep1.id, date=today - timedelta(days=1), volume=3.0),
            MilkProduction(sheep_id=sheep2.id, date=today - timedelta(days=1), volume=5.0),
            MilkProduction(sheep_id=sheep3.id, date=today - timedelta(days=2), volume=7.0),
            MilkProduction(sheep_id=sheep1.id, date=today - timedelta(days=3), volume=4.0),
            MilkProduction(sheep_id=sheep2.id, date=today - timedelta(days=3), volume=6.0),
            MilkProduction(sheep_id=sheep3.id, date=today - timedelta(days=4), volume=8.0),
            MilkProduction(sheep_id=sheep1.id, date=today - timedelta(days=5), volume=4.5),
            MilkProduction(sheep_id=sheep2.id, date=today - timedelta(days=5), volume=5.5),
            MilkProduction(sheep_id=sheep3.id, date=today - timedelta(days=6), volume=9.0)
        ]
        db.add_all(milk_data)
        db.commit()

    # Acessar o endpoint
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/total-last-7-days", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        result = response.json()

        # O volume total por grupo nos últimos 7 dias deve ser:
        # - Grupo A: 3+5 + 4+6 + 4.5+5.5 = 28.0
        # - Grupo B: 7.0 + 8.0 + 9.0 = 24.0
        assert len(result) == 2
        for group in result:
            if group["group_name"] == "Grupo A":
                assert group["total_volume"] == 28.0
            elif group["group_name"] == "Grupo B":
                assert group["total_volume"] == 24.0



@pytest.mark.asyncio
async def test_total_week_before_endpoint():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()


    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        # Criar grupos
        db.execute(text("INSERT INTO sheep_group (name, farm_id) VALUES ('Grupo A', :fid), ('Grupo B', :fid)"), {"fid": farm_id})
        db.commit()

        group_a = db.execute(text("SELECT * FROM sheep_group WHERE name='Grupo A'")).fetchone()
        group_b = db.execute(text("SELECT * FROM sheep_group WHERE name='Grupo B'")).fetchone()

        # Criar ovelhas
        sheep1 = Sheep(birth_date="2023-01-01", gender="female", status="healthy", farm_id=farm_id, group_id=group_a.id)
        sheep2 = Sheep(birth_date="2023-01-02", gender="female", status="healthy", farm_id=farm_id, group_id=group_a.id)
        sheep3 = Sheep(birth_date="2023-01-03", gender="female", status="healthy", farm_id=farm_id, group_id=group_b.id)

        db.add_all([sheep1, sheep2, sheep3])
        db.commit()
        db.refresh(sheep1)
        db.refresh(sheep2)
        db.refresh(sheep3)

        today = date.today()
        # Semana passada (entre 8 e 14 dias atrás)
        milk_data = [
            MilkProduction(sheep_id=sheep1.id, date=today - timedelta(days=8), volume=3.0),
            MilkProduction(sheep_id=sheep2.id, date=today - timedelta(days=9), volume=5.0),
            MilkProduction(sheep_id=sheep3.id, date=today - timedelta(days=10), volume=7.0),
            MilkProduction(sheep_id=sheep1.id, date=today - timedelta(days=11), volume=4.0),
            MilkProduction(sheep_id=sheep2.id, date=today - timedelta(days=12), volume=6.0),
            MilkProduction(sheep_id=sheep3.id, date=today - timedelta(days=13), volume=8.0),
            MilkProduction(sheep_id=sheep1.id, date=today - timedelta(days=14), volume=4.5),
            MilkProduction(sheep_id=sheep2.id, date=today - timedelta(days=14), volume=5.5)
        ]
        db.add_all(milk_data)
        db.commit()

    # Acessar o endpoint
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/total-week-before", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        result = response.json()

        # Esperado:
        # Grupo A: 3 + 5 + 4 + 6 + 4.5 + 5.5 = 28.0
        # Grupo B: 7 + 8 = 15.0
        assert len(result) == 2
        for group in result:
            if group["group_name"] == "Grupo A":
                assert group["total_volume"] == 28.0
            elif group["group_name"] == "Grupo B":
                assert group["total_volume"] == 15.0



@pytest.mark.asyncio
async def test_total_yesterday_endpoint():
    from datetime import date, timedelta

    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        sheep1 = Sheep(
            birth_date="2023-01-01",
            gender="female",
            status="healthy",
            farm_id=farm_id
        )
        sheep2 = Sheep(
            birth_date="2023-01-02",
            gender="female",
            status="healthy",
            farm_id=farm_id
        )
        db.add_all([sheep1, sheep2])
        db.commit()
        db.refresh(sheep1)
        db.refresh(sheep2)

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Produção ontem (relevante) e hoje (não relevante)
        milk_data = [
            MilkProduction(sheep_id=sheep1.id, date=yesterday, volume=4.5),
            MilkProduction(sheep_id=sheep2.id, date=yesterday, volume=3.5),
            MilkProduction(sheep_id=sheep1.id, date=today, volume=10.0),  # não deve contar
        ]
        db.add_all(milk_data)
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/total-yesterday", headers={
            "Authorization": f"Bearer {token}"
        })

        print(response.status_code)
        print(response.json()) 

        assert response.status_code == 200
        data = response.json()

        assert "total_volume" in data
        assert "date" in data
        assert data["date"] == str(yesterday)
        assert data["total_volume"] == 8.0  # 4.5 + 3.5




@pytest.mark.asyncio
async def test_sum_last_7_days_endpoint():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        sheep = Sheep(
            birth_date="2023-01-01",
            gender="female",
            status="healthy",
            farm_id=farm_id
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)

        today = date.today()
        last_7_days = [today - timedelta(days=i) for i in range(7)]  # 0 a 6 dias atrás

        milk_data = [
            MilkProduction(sheep_id=sheep.id, date=d, volume=5.0) for d in last_7_days
        ]
        milk_data.append(MilkProduction(sheep_id=sheep.id, date=today - timedelta(days=8), volume=99.0))  # fora do intervalo
        db.add_all(milk_data)
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/sum-last-7-days", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        data = response.json()

        assert "total_volume" in data
        assert "start_date" in data
        assert "end_date" in data
        assert data["total_volume"] == 35.0  # 7 dias * 5.0



@pytest.mark.asyncio
async def test_sum_2_weeks_ago_endpoint():
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        sheep = Sheep(
            birth_date="2023-01-01",
            gender="female",
            status="healthy",
            farm_id=farm_id
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)

        today = date.today()
        start_date = today - timedelta(days=14)
        end_date = today - timedelta(days=8)

        valid_days = [start_date + timedelta(days=i) for i in range((end_date - start_date).days + 1)]

        milk_data = [
            MilkProduction(sheep_id=sheep.id, date=d, volume=4.0) for d in valid_days
        ]
        # Fora do intervalo
        milk_data.append(MilkProduction(sheep_id=sheep.id, date=today - timedelta(days=7), volume=99.0))

        db.add_all(milk_data)
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/sum-2-weeks-ago", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        data = response.json()

        assert "total_volume" in data
        assert "start_date" in data
        assert "end_date" in data
        assert data["total_volume"] == len(valid_days) * 4.0




@pytest.mark.asyncio
async def test_daily_total_last_7_days_endpoint():
    from datetime import date, timedelta

    # Limpa as tabelas
    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))  # Corrigir para o nome correto da tabela
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        sheep1 = Sheep(birth_date="2023-01-01", gender="female", status="healthy", farm_id=farm_id)
        sheep2 = Sheep(birth_date="2023-01-02", gender="female", status="healthy", farm_id=farm_id)
        db.add_all([sheep1, sheep2])
        db.commit()
        db.refresh(sheep1)
        db.refresh(sheep2)

        today = date.today()
        days = [today - timedelta(days=i) for i in range(7)]

        milk_data = [
            MilkProduction(sheep_id=sheep1.id, date=days[0], volume=4.0),
            MilkProduction(sheep_id=sheep2.id, date=days[0], volume=2.0),
            MilkProduction(sheep_id=sheep1.id, date=days[1], volume=5.0),
        ]
        db.add_all(milk_data)
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/daily-total-last-7-days", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert any(item["date"] == str(days[0]) and item["total_volume"] == 6.0 for item in data)
        assert any(item["date"] == str(days[1]) and item["total_volume"] == 5.0 for item in data)


@pytest.mark.asyncio
async def test_daily_by_group_last_7_days_endpoint():
    from datetime import date, timedelta

    with SessionLocal() as db:
        db.execute(text("DELETE FROM milk_production_individual"))  # Corrigir para o nome correto da tabela
        db.execute(text("DELETE FROM sheep"))
        db.execute(text("DELETE FROM sheep_group"))
        db.execute(text("DELETE FROM veterinarian"))
        db.execute(text("DELETE FROM farmer"))
        db.execute(text("DELETE FROM farm_inventory"))
        db.execute(text("DELETE FROM farm"))
        db.commit()

    farm_id = create_test_user_and_farm()

    with SessionLocal() as db:
        group = SheepGroup(name="Grupo A", farm_id=farm_id)
        db.add(group)
        db.commit()
        db.refresh(group)

        sheep = Sheep(
            birth_date="2023-01-01",
            gender="female",
            status="healthy",
            farm_id=farm_id,
            group_id=group.id
        )
        db.add(sheep)
        db.commit()
        db.refresh(sheep)

        today = date.today()
        day_1 = today - timedelta(days=1)
        day_2 = today - timedelta(days=2)

        milk_data = [
            MilkProduction(sheep_id=sheep.id, date=day_1, volume=4.5),
            MilkProduction(sheep_id=sheep.id, date=day_2, volume=3.0),
        ]
        db.add_all(milk_data)
        db.commit()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_response = await ac.post("/auth/login", json={
            "email": "milk@test.com",
            "password": "milk123"
        })
        token = login_response.json()["access_token"]

        response = await ac.get("/milk-production/daily-by-group-last-7-days", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert any(item["date"] == str(day_1) and item["group_name"] == "Grupo A" and item["total_volume"] == 4.5 for item in data)
        assert any(item["date"] == str(day_2) and item["group_name"] == "Grupo A" and item["total_volume"] == 3.0 for item in data)
