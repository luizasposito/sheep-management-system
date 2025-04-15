# main.py

from fastapi import FastAPI
from database import Base, engine
from routers import sheep  # Import your sheep router

# Create the FastAPI app
app = FastAPI()

from models import farm

# Create all database tables (based on your models)
Base.metadata.create_all(bind=engine)

# Register the sheep routes under the path /sheep
app.include_router(sheep.router, prefix="/sheep", tags=["Sheep"])
