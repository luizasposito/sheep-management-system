

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.farm_inventory import FarmInventory
from schemas.farm_inventory import InventoryCreate, InventoryResponse
from typing import List
from schemas.farm_inventory import InventoryResponse
from models.farm_inventory import FarmInventory


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



# GET /inventory - Get all inventory items
@router.get("/", response_model=List[InventoryResponse])
def get_all_inventory(db: Session = Depends(get_db)):
    items = db.query(FarmInventory).all()
    return items



# GET /inventory/{id} - Get a single inventory item by ID
@router.get("/{id}", response_model=InventoryResponse)
def get_inventory_item(id: int, db: Session = Depends(get_db)):
    item = db.query(FarmInventory).filter(FarmInventory.id == id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    return item