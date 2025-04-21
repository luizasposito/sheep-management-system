
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sheep import Sheep
from models.farm import Farm
from models.farm_inventory import FarmInventory
from models.farmer import Farmer
from schemas.sheep import SheepCreate, SheepResponse, MilkYieldUpdate
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from pydantic import BaseModel


# router for all /sheep endpoints
router = APIRouter()


# POST /sheep - create a new sheep record
@router.post("/", response_model=SheepResponse)
def create_sheep(
    sheep: SheepCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    new_sheep = Sheep(**sheep.model_dump())
    db.add(new_sheep)
    db.commit()
    db.refresh(new_sheep)
    return new_sheep



# GET /sheep - return a list of all sheep
@router.get("/", response_model=List[SheepResponse])
def get_all_sheep(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)  # exige autenticação
):
    # get all sheep from the database
    sheep_list = db.query(Sheep).all()
    return sheep_list



# GET /sheep/id - return specific sheep
@router.get("/{sheep_id}", response_model=SheepResponse)
def get_sheep_by_id(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # look for a sheep by ID
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()

    # if not found, raise an error
    if sheep is None:
        raise HTTPException(status_code=404, detail="Sheep not found")

    return sheep




# PUT /sheep/{id} - update existing sheep
@router.put("/{sheep_id}", response_model=SheepResponse)
def update_sheep(
    sheep_id: int,
    updated_sheep: SheepCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # only farmers
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    # search sheep
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # verify if farmer is the right one
    farmer = db.query(Farmer).filter(Farmer.id == current_user.id).first()
    if not farmer or farmer.farm_id != sheep.farm_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this sheep")

    # update sheep
    for field, value in updated_sheep.model_dump().items():
        setattr(sheep, field, value)

    db.commit()
    db.refresh(sheep)

    return sheep




# DELETE /sheep/{id} - remove a sheep from the database
@router.delete("/{sheep_id}", status_code=204)
def delete_sheep(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # find the sheep
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()

    # if not found, raise an error
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # delete and commit
    db.delete(sheep)
    db.commit()

    # don't return anything
    return



# PATCH /milk yield
@router.patch("/{sheep_id}/milk-yield", response_model=SheepResponse)
def update_milk_yield(
    sheep_id: int,
    data: MilkYieldUpdate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    farmer = db.query(Farmer).filter(Farmer.id == current_user.id).first()
    if not farmer or farmer.farm_id != sheep.farm_id:
        raise HTTPException(status_code=403, detail="You don't have permission to update this sheep")

    sheep.milk_production = data.milk_production
    db.commit()
    db.refresh(sheep)
    return sheep