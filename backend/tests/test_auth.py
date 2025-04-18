import pytest
from httpx import AsyncClient, ASGITransport
import sys, os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app
from utils import hash_password, create_access_token
from database import SessionLocal
from models.farmer import Farmer
from models.farm import Farm
from models.veterinarian import Veterinarian

# login for users
@pytest.mark.asyncio
async def test_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # import everything 
        from database import SessionLocal, Base, engine
        from models.farm import Farm
        from models.farmer import Farmer
        from utils import hash_password
        from sqlalchemy import text

        # completely drop all tables even with FK constraints (PostgreSQL-safe)
        with engine.connect() as connection:
            connection.execute(text("DROP SCHEMA public CASCADE;"))
            connection.execute(text("CREATE SCHEMA public;"))
            connection.commit()

        # recreate all tables
        Base.metadata.create_all(bind=engine)

        # start a new database session
        with SessionLocal() as db:
            # create a new farm
            farm = Farm(name="Login Test Farm", location="Somewhere")
            db.add(farm)
            db.commit()
            db.refresh(farm)

            # create a new farmer
            farmer = Farmer(
                name="Login User",
                email="login@example.com",
                password=hash_password("securepassword"),
                farm_id=farm.id
            )
            db.add(farmer)
            db.commit()

        # test the login endpoint
        response = await ac.post("/auth/login", json={
            "email": "login@example.com",
            "password": "securepassword"
        })


        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"






# get current user's token
@pytest.mark.asyncio
async def test_get_current_user():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        # Setup test data
        with SessionLocal() as db:
            db.query(Veterinarian).delete()
            db.query(Farmer).delete()
            db.query(Farm).delete()
            db.commit()

            farm = Farm(name="Farm Test", location="Nowhere")
            db.add(farm)
            db.commit()
            db.refresh(farm)

            farmer = Farmer(
                name="Test Farmer",
                email="me@example.com",
                password=hash_password("pass"),
                farm_id=farm.id
            )
            db.add(farmer)
            db.commit()

        # Generate token
        token = create_access_token({"sub": "me@example.com", "role": "farmer"})

        # Call /auth/me with token
        response = await ac.get("/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })

        assert response.status_code == 200
        assert response.json()["email"] == "me@example.com"