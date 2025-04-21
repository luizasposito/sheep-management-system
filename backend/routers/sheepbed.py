
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
from typing import List

router = APIRouter()

# GET /sheepbeds
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