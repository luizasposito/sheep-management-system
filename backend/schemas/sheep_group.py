
from pydantic import BaseModel
from typing import Optional

class SheepGroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class SheepGroupCreate(SheepGroupBase):
    pass

class SheepGroupResponse(SheepGroupBase):
    id: int
    farm_id: int

    class Config:
        orm_mode = True
