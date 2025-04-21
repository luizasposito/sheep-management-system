
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from schemas.sensortype import SensorTypeSchema
from typing import Optional

class AirQualityResponse(BaseModel):
    sensor_type: SensorTypeResponse
    current_value: float
    low_threshold: float
    high_threshold: float
    timestamp: str

    class Config:
        from_attributes = True

class SensorTypeSchema(BaseModel):
    id: int
    name: str
    unit: Optional[str]

    class Config:
        from_attributes = True

class SensorTypeResponse(BaseModel):
    id: int
    name: str
    unit: str