
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.consultation import Consultation
from schemas.consultation import ConsultationResponse
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser

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
