from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from appointment.model_appointment import Appointment
from sheep.model_sheep import Sheep
from appointment.model_medication import Medication
from farmer.model_farmer import Farmer
from veterinarian.model_veterinarian import Veterinarian
from appointment.schema_appointment import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from farmer.schema_farmer import FarmerCreate, FarmerResponse
from veterinarian.schema_veterinarian import VeterinarianCreate, VeterinarianResponse
from typing import List
from auth.router_auth import get_current_user
from auth.schema_auth import TokenUser

router = APIRouter()

# Helper para extrair os sheep_ids de um Appointment
def serialize_appointment(appointment: Appointment) -> AppointmentResponse:
    return AppointmentResponse(
        id=appointment.id,
        vet_id=appointment.vet_id,
        date=appointment.date,
        motivo=appointment.motivo,
        comentarios=appointment.comentarios,
        sheep_ids=[sheep.id for sheep in appointment.sheeps],
        medications=appointment.medications
    )


# 1) GET /appointment - Listar todas as consultas
@router.get("/", response_model=List[AppointmentResponse])
def get_all_appointments(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    appointments = db.query(Appointment).all()
    return [serialize_appointment(appt) for appt in appointments]


# 2) GET /appointment/{id} - Ver detalhes de uma consulta
@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment_by_id(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return serialize_appointment(appointment)


# 3) POST /appointment - Agendar uma nova consulta
@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)  # assume que ele retorna um fazendeiro autenticado
):
    # Verificar se current_user é realmente um fazendeiro
    farmer = db.query(Farmer).filter(Farmer.id == current_user.id).first()
    if not farmer:
        raise HTTPException(status_code=403, detail="Only farmers can create appointments.")

    # Buscar o veterinário da fazenda
    vet = db.query(Veterinarian).filter(Veterinarian.farm_id == farmer.farm_id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="No veterinarian associated with the farm.")

    # Buscar todas as ovelhas (e validar existência)
    sheeps = db.query(Sheep).filter(Sheep.id.in_(data.sheep_ids)).all()
    if len(sheeps) != len(data.sheep_ids):
        raise HTTPException(status_code=404, detail="One or more sheep not found.")

    # Criar a consulta
    appointment = Appointment(
        vet_id=vet.id,
        motivo=data.motivo,
        comentarios=data.comentarios,
        sheeps=sheeps,
        date=data.date,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return serialize_appointment(appointment)



# 4) PATCH /appointment/{id} - Editar dados de uma consulta
@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    updated: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "veterinarian":
        raise HTTPException(status_code=403, detail="Only veterinarians can update appointments.")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if updated.motivo is not None:
        appointment.motivo = updated.motivo
    if updated.comentarios is not None:
        appointment.comentarios = updated.comentarios

    if updated.medications is not None:
        # Deleta medicamentos antigos no banco
        db.query(Medication).filter(Medication.appointment_id == appointment_id).delete()
        # Adiciona novos
        for med in updated.medications:
            new_med = Medication(
                name=med.name,
                dosage=med.dosage,
                indication=med.indication,
                appointment=appointment,
            )
            db.add(new_med)

    db.commit()
    db.refresh(appointment)
    return serialize_appointment(appointment)