
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ConsultationBase(BaseModel):
    sheep_id: int
    vet_id: int

class ConsultationCreate(ConsultationBase):
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    follow_up_date: Optional[date] = None

class ConsultationResponse(ConsultationCreate):
    id: int
    date: datetime

    class Config:
        from_attributes = True