
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