from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class AppointmentBase(BaseModel):
    sheep_ids: List[int]
    vet_id: int

class MedicationInput(BaseModel):
    name: str
    dosage: Optional[str]
    indication: Optional[str]

class MedicationResponse(BaseModel):
    id: int
    name: str
    dosage: Optional[str]
    indication: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class AppointmentCreate(AppointmentBase):
    motivo: Optional[str] = None
    comentarios: Optional[str] = None
    date: Optional[datetime] = None  # Adicione este campo

class AppointmentStartRequest(BaseModel):
    sheep_ids: List[int]

class AppointmentResponse(BaseModel):
    id: int
    sheep_ids: List[int]
    vet_id: int
    date: datetime
    motivo: Optional[str] = None
    comentarios: Optional[str] = None
    medications: Optional[List[MedicationResponse]] = []

    model_config = ConfigDict(from_attributes=True)

class AppointmentUpdate(BaseModel):
    motivo: Optional[str] = None
    comentarios: Optional[str] = None
    medications: Optional[List[MedicationInput]] = None