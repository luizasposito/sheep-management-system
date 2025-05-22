
from pydantic import BaseModel
from datetime import date
from typing import Optional, Literal

# POST request
class SheepCreate(BaseModel):
    # id isnt sent to the db
    birth_date: date
    farm_id: int
    feeding_hay: float
    feeding_feed: float
    gender: Literal["Macho", "Fêmea"]
    group_id: Optional[int] = None
    father_id: Optional[int] = None
    mother_id: Optional[int] = None

# GET/POST responses
class SheepResponse(SheepCreate):
    # id is returned by the db
    id: int
    milk_production: Optional[float] = None
    
    model_config = {
    # tells FastAPI to convert SQLAlchemy objects to JSON
    "from_attributes": True
}
    

class SheepUpdate(BaseModel):
    birth_date: Optional[date]
    feeding_hay: Optional[float]
    feeding_feed: Optional[float]
    gender: Optional[str]
    group_id: Optional[int]
    farm_id: Optional[int]
    father_id: Optional[int]
    mother_id: Optional[int]