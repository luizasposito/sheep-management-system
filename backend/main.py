# main.py

from fastapi import FastAPI
from database import Base, engine
from routers import sheep
from routers import farm_inventory
from routers import farmer

# Create the FastAPI app
app = FastAPI()

from models import farm

# Create all database tables (based on your models)
Base.metadata.create_all(bind=engine)

# register sheep routes under /sheep path
app.include_router(sheep.router, prefix="/sheep", tags=["Sheep"])

# register inventory routes under /inventory path
app.include_router(farm_inventory.router, prefix="/inventory", tags=["Inventory"])

# register farmer routes under /farmer path
app.include_router(farmer.router, prefix="/farmer", tags=["Farmer"])