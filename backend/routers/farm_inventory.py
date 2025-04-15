

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.farm_inventory import FarmInventory
from schemas.farm_inventory import InventoryCreate, InventoryResponse


router = APIRouter()


# POST /inventory - Create a new inventory item
@router.post("/", response_model=InventoryResponse)
def create_inventory_item(item: InventoryCreate, db: Session = Depends(get_db)):
    # convert from Pydantic to SQLAlchemy
    new_item = FarmInventory(**item.model_dump())

    # save to the database
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item
