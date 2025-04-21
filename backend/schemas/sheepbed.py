
from pydantic import BaseModel
from datetime import datetime

class SheepBedBase(BaseModel):
    sheep_id: int
    location: str
    cleaning_interval_days: int

class SheepBedCreate(SheepBedBase):
    pass

class SheepBedUpdate(SheepBedBase):
    pass

class SheepBedResponse(BaseModel):
    id: int
    sheep_id: int
    location: str
    last_cleaned: datetime
    cleaning_interval_days: int

    class Config:
        from_attributes = True

class SheepBedCleanUpdate(BaseModel):
    last_cleaned: datetime

class SheepBedIntervalUpdate(BaseModel):
    cleaning_interval_days: int