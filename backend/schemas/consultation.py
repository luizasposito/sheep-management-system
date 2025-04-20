
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

class ConsultationStartRequest(BaseModel):
    sheep_id: int

class ConsultationResponse(BaseModel):
    id: int
    sheep_id: int
    vet_id: int
    date: datetime
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    follow_up_date: Optional[date] = None

    class Config:
        from_attributes = True

class ConsultationUpdate(BaseModel):
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    follow_up_date: Optional[date] = None
