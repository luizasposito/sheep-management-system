
from pydantic import BaseModel
from typing import Optional
from typing import List

class SheepGroupBase(BaseModel):
    name: str
    description: Optional[str] = None


class SheepGroupCreate(SheepGroupBase):
    sheep_ids: Optional[List[int]] = None


class SheepGroupResponse(SheepGroupBase):
    id: int
    farm_id: int

    class Config:
        from_attributes = True
