from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone

class InventoryCreate(BaseModel):
    item_name: str
    quantity: int
    unit: str
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    consumption_rate: float
    category: str

class InventoryResponse(InventoryCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
