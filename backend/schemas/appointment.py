from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentBase(BaseModel):
    sheep_id: int
    vet_id: int

class AppointmentCreate(AppointmentBase):
    motivo: Optional[str] = None
    comentarios: Optional[str] = None

class AppointmentStartRequest(BaseModel):
    sheep_id: int

class AppointmentResponse(BaseModel):
    id: int
    sheep_id: int
    vet_id: int
    date: datetime
    motivo: Optional[str] = None
    comentarios: Optional[str] = None

    class Config:
        from_attributes = True

class AppointmentUpdate(BaseModel):
    motivo: Optional[str] = None
    comentarios: Optional[str] = None
