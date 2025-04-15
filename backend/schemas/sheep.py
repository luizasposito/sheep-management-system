
from pydantic import BaseModel
from datetime import date
from typing import Optional

# POST request
class SheepCreate(BaseModel):
    id: int
    birth_date: date
    farm_id: int
    milk_production: float
    feeding_hay: float
    feeding_feed: float
    gender: str
    status: str

# GET/POST responses
class SheepResponse(SheepCreate):
    model_config = {
    # tells FastAPI to convert SQLAlchemy objects to JSON
    "from_attributes": True
}