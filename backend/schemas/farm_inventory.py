from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InventoryCreate(BaseModel):
    farm_id: Optional[int] = None
    item_name: str
    quantity: int
    unit: str
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    consumption_rate: float
    category: str

class InventoryResponse(InventoryCreate):
    id: int

    model_config = {
        "from_attributes": True
    }
