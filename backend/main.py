
from fastapi import FastAPI
from database import Base, engine
from routers import sheep
from routers import farm_inventory
from routers import farmer
from routers import veterinarian
from routers import auth
from routers import appointment
from routers import sheep_group   
from routers import milk_production     
from routers import sensor
from fastapi.middleware.cors import CORSMiddleware                                                                                                                                                           

# Create the FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # permite o frontend acessar o backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# register appointment routes under /appointment path
app.include_router(appointment.router, prefix="/appointment", tags=["Appointment"])

# register sheep_group routes under /sheep-group path
app.include_router(sheep_group.router, prefix="/sheep-group", tags=["Group"])

# register milkproduction routes under /milk-production path
app.include_router(milk_production.router, prefix="/milk-production", tags=["MilkProduction"])

# register sensors routes under /sensor path
app.include_router(sensor.router, prefix="/sensor", tags=["Sensor"])