from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.appointment import Appointment
from models.sheep import Sheep
from schemas.appointment import AppointmentCreate, AppointmentResponse, AppointmentStartRequest, AppointmentUpdate
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from datetime import date

router = APIRouter()

# GET /appointment - Get list of appointments
@router.get("/", response_model=List[AppointmentResponse])
def get_all_appointments(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    appointments = db.query(Appointment).all()
    return appointments

# GET /appointment/{id} - Get appointment by id
@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment_by_id(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment

# POST /appointment/start - Start a consultation for a sheep
@router.post("/start", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def start_consultation(
    request: AppointmentStartRequest,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # Only veterinarians are allowed to start consultations
    if current_user.role != "veterinarian":
        raise HTTPException(status_code=403, detail="Only veterinarians can start consultations")

    # Check if sheep exists
    sheep = db.query(Sheep).filter(Sheep.id == request.sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # Create an appointment with no details (start of consultation)
    appointment = Appointment(
        sheep_id=request.sheep_id,
        vet_id=current_user.id,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment

# POST /appointment/{id} - Fill out appointment details (diagnosis, treatment, etc.)
@router.post("/{appointment_id}", response_model=AppointmentResponse)
def fill_appointment_details(
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

    appointment.motivo = updated.motivo
    appointment.comentarios = updated.comentarios

    db.commit()
    db.refresh(appointment)
    return appointment
