
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.consultation import Consultation
from models.sheep import Sheep
from schemas.consultation import ConsultationCreate, ConsultationResponse, ConsultationStartRequest, ConsultationUpdate
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from datetime import date


router = APIRouter()


# GET /consultation - get list of consultations
@router.get("/", response_model=List[ConsultationResponse])
def get_all_consultations(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # permitted for both farmer and veterinarian
    consultations = db.query(Consultation).all()
    return consultations




# GET /consultation/{id} - get consultation by id
@router.get("/{consultation_id}", response_model=ConsultationResponse)
def get_consultation_by_id(
    consultation_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")
    return consultation




# POST /consultation/start - start consultation for sheep
@router.post("/start", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def start_consultation(
    request: ConsultationStartRequest,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # only veterinarians are allowed
    if current_user.role != "veterinarian":
        raise HTTPException(status_code=403, detail="Only veterinarians can start consultations")

    # check if sheep exists
    sheep = db.query(Sheep).filter(Sheep.id == request.sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # create empty consultation with follow_up_date = today
    consultation = Consultation(
        sheep_id=request.sheep_id,
        vet_id=current_user.id,
        follow_up_date=date.today()
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    return consultation



# POST /consultation/{id} - fill out consultation details
@router.post("/{consultation_id}", response_model=ConsultationResponse)
def fill_consultation_details(
    consultation_id: int,
    updated: ConsultationUpdate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "veterinarian":
        raise HTTPException(status_code=403, detail="Only veterinarians can update consultations.")

    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()

    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found")

    consultation.diagnosis = updated.diagnosis
    consultation.treatment = updated.treatment
    consultation.follow_up_date = updated.follow_up_date

    db.commit()
    db.refresh(consultation)
    return consultation