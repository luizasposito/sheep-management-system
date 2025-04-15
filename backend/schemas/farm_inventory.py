
from pydantic import BaseModel
from typing import Optional

class InventoryCreate(BaseModel):
    farm_id: int
    item_name: str
    quantity: int
    unit: str
    consumption_rate: float

class InventoryResponse(InventoryCreate):
    id: int

    model_config = {
        # allows FastAPI to return SQLAlchemy model as JSON
        "from_attributes": True
    }
