

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.farm_inventory import FarmInventory
from schemas.farm_inventory import InventoryCreate, InventoryResponse
from typing import List
from schemas.farm_inventory import InventoryResponse
from models.farm_inventory import FarmInventory
from routers.auth import get_current_user
from schemas.auth import TokenUser


router = APIRouter()


# POST /inventory - create a new inventory item
@router.post("/", response_model=InventoryResponse)
def create_inventory_item(
    item: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")
    # convert from Pydantic to SQLAlchemy
    new_item = FarmInventory(**item.model_dump())

    # save to the database
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item



# GET /inventory - get all inventory items
@router.get("/", response_model=List[InventoryResponse])
def get_all_inventory(db: Session = Depends(get_db)):
    items = db.query(FarmInventory).all()
    return items



# GET /inventory/{id} - get an inventory item by ID
@router.get("/{id}", response_model=InventoryResponse)
def get_inventory_item(id: int, db: Session = Depends(get_db)):
    item = db.query(FarmInventory).filter(FarmInventory.id == id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    return item




# PUT /inventory/{id} - update an item in the inventory
@router.put("/{id}", response_model=InventoryResponse)
def update_inventory_item(id: int, item: InventoryCreate, db: Session = Depends(get_db)):
    existing_item = db.query(FarmInventory).filter(FarmInventory.id == id).first()

    if not existing_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Update the item
    for key, value in item.model_dump().items():
        setattr(existing_item, key, value)

    db.commit()
    db.refresh(existing_item)

    return existing_item



# DELETE /inventory/{id} - delete an item in the inventory
@router.delete("/{id}", status_code=204)
def delete_inventory_item(id: int, db: Session = Depends(get_db)):
    item = db.query(FarmInventory).filter(FarmInventory.id == id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    db.delete(item)
    db.commit()
    return
