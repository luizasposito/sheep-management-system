
from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, Literal


class SheepCreate(BaseModel):
    birth_date: date
    farm_id: int
    feeding_hay: float
    feeding_feed: float
    gender: Literal["Macho", "Fêmea"]
    group_id: Optional[int] = None
    father_id: Optional[int] = None
    mother_id: Optional[int] = None

class SheepResponse(SheepCreate):
    id: int
    milk_production: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class SheepUpdate(BaseModel):
    birth_date: Optional[date] = None
    feeding_hay: Optional[float] = None
    feeding_feed: Optional[float] = None
    gender: Optional[Literal["Macho", "Fêmea"]] = None
    group_id: Optional[int] = None
    farm_id: Optional[int] = None
    father_id: Optional[int] = None
    mother_id: Optional[int] = None