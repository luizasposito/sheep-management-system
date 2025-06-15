
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class SensorBase(BaseModel):
    name: str
    min_value: Optional[float] = Field(None, description="Valor mínimo aceitável do sensor")
    max_value: Optional[float] = Field(None, description="Valor máximo aceitável do sensor")
    current_value: float

class SensorCreate(SensorBase):
    pass

class SensorUpdate(SensorBase):
    pass

class SensorResponse(SensorBase):
    id: int
    farm_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
