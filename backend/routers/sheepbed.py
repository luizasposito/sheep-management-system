
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.auth import TokenUser
from routers.auth import get_current_user
from models.sheepbed import SheepBed
from models.sheep import Sheep
from schemas.sheepbed import SheepBedResponse
from models.farm import Farm
from models.farmer import Farmer
from datetime import datetime
from typing import List
from pydantic import BaseModel


class SheepBedCleanUpdate(BaseModel):
    last_cleaned: datetime

router = APIRouter()

# GET /sheepbed
@router.get("/", response_model=List[SheepBedResponse])
def get_all_sheep_beds(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # only farmers
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    # search all sheepbeds
    sheep_beds = db.query(SheepBed).all()

    # if no bed, error
    if not sheep_beds:
        raise HTTPException(status_code=404, detail="No sheep beds found")

    return sheep_beds




# PATCH /sheepbed/{id}/clean - update last_cleaned date
@router.patch("/{sheep_bed_id}/clean", response_model=SheepBedResponse)
def clean_sheep_bed(
    sheep_bed_id: int,
    data: SheepBedCleanUpdate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    sheep_bed = db.query(SheepBed).filter(SheepBed.id == sheep_bed_id).first()
    if not sheep_bed:
        raise HTTPException(status_code=404, detail="Sheep bed not found")

    # Update last cleaned date
    sheep_bed.last_cleaned = data.last_cleaned
    db.commit()
    db.refresh(sheep_bed)
    return sheep_bed