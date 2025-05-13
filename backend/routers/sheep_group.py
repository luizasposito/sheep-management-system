
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sheep import Sheep
from models.farm import Farm
from models.farm_inventory import FarmInventory
from models.farmer import Farmer
from schemas.sheep import SheepCreate, SheepResponse
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from pydantic import BaseModel
from models.sheep_group import SheepGroup
from schemas.sheep_group import SheepGroupCreate, SheepGroupResponse

router = APIRouter()

@router.post("", response_model=SheepGroupResponse)
def create_sheep_group(
    group: SheepGroupCreate,
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    # Buscar o farmer no banco usando o email do token
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    sheep_group = SheepGroup(
        name=group.name,
        description=group.description,
        farm_id=farmer.farm_id   # pegando o farm_id do farmer real
    )
    db.add(sheep_group)
    db.commit()
    db.refresh(sheep_group)
    return sheep_group
