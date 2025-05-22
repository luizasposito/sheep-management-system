
from pydantic import BaseModel
from datetime import date
from typing import Optional

# POST request
class SheepCreate(BaseModel):
    # id isnt sent to the db
    birth_date: date
    farm_id: int
    feeding_hay: float
    feeding_feed: float
    gender: str
    group_id: Optional[int] = None

    father_id: Optional[int] = None
    mother_id: Optional[int] = None

# GET/POST responses
class SheepResponse(SheepCreate):
    # id is returned by the db
    id: int
    
    model_config = {
    # tells FastAPI to convert SQLAlchemy objects to JSON
    "from_attributes": True
}