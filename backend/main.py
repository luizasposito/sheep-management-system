# main.py

from fastapi import FastAPI
from database import Base, engine
from routers import sheep
from routers import farm_inventory
from routers import farmer
from routers import veterinarian
from routers import auth
from routers import consultation
from routers import sheepbed
from routers import airquality

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

# register veterinarian routes under /veterinarian path
app.include_router(veterinarian.router, prefix="/vet", tags=["Veterinarian"])

# register authentication routes under /auth path
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

# register consultation routes under /consultation path
app.include_router(consultation.router, prefix="/consultation", tags=["Consultation"])

# register sheepbed routes under /sheepbed path
app.include_router(sheepbed.router, prefix="/sheepbed", tags=["SheepBed"])

# register airquality routes under /airquality path
app.include_router(airquality.router, prefix="/airquality", tags=["AirQuality"])