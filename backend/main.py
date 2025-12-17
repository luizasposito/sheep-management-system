
from fastapi import FastAPI
from database import Base, engine
from sheep import router_sheep
from inventory import router_inventory
from farmer import router_farmer
from veterinarian import router_veterinarian
from auth import router_auth
from appointment import router_appointment
from sheepgroup import router_sheepgroup   
from milkproduction import router_milkproduction     
from sensor import router_sensor
from fastapi.middleware.cors import CORSMiddleware
import os                                                                                                                                                      
from dotenv import load_dotenv
load_dotenv()


# Create the FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create all database tables (based on your models)
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


# register sheep routes under /sheep path
app.include_router(router_sheep.router, prefix="/sheep", tags=["Sheep"])

# register inventory routes under /inventory path
app.include_router(router_inventory.router, prefix="/inventory", tags=["Inventory"])

# register farmer routes under /farmer path
app.include_router(router_farmer.router, prefix="/farmer", tags=["Farmer"])

# register veterinarian routes under /veterinarian path
app.include_router(router_veterinarian.router, prefix="/vet", tags=["Veterinarian"])

# register authentication routes under /auth path
app.include_router(router_auth.router, prefix="/auth", tags=["Auth"])

# register appointment routes under /appointment path
app.include_router(router_appointment.router, prefix="/appointment", tags=["Appointment"])

# register sheep_group routes under /sheep-group path
app.include_router(router_sheepgroup.router, prefix="/sheep-group", tags=["Group"])

# register milkproduction routes under /milk-production path
app.include_router(router_milkproduction.router, prefix="/milk-production", tags=["MilkProduction"])

# register sensors routes under /sensor path
app.include_router(router_sensor.router, prefix="/sensor", tags=["Sensor"])