from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from inventory.model_inventory import FarmInventory
from inventory.schema_inventory import InventoryCreate, InventoryResponse
from typing import List
from auth.router_auth import get_current_user
from auth.schema_auth import TokenUser
from datetime import datetime


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

    if not current_user.farm_id:
        raise HTTPException(status_code=400, detail="User is not linked to any farm")

    # Preenche farm_id e last_updated se não enviados
    data = item.model_dump()
    data["farm_id"] = current_user.farm_id
    if "last_updated" not in data or data["last_updated"] is None:
        data["last_updated"] = datetime.utcnow()

    new_item = FarmInventory(**data)

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


# GET /inventory - get all inventory items
@router.get("/", response_model=List[InventoryResponse])
def get_all_inventory(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    items = db.query(FarmInventory)\
        .filter(FarmInventory.farm_id == current_user.farm_id)\
        .order_by(FarmInventory.item_name.asc())\
        .all()
    
    return items


# GET /inventory/{id} - get an inventory item by ID
@router.get("/{id}", response_model=InventoryResponse)
def get_inventory_item(
    id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    item = db.query(FarmInventory).filter(FarmInventory.id == id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    return item


# PUT /inventory/{id} - update an item in the inventory
@router.put("/{id}", response_model=InventoryResponse)
def update_inventory_item(
    id: int,
    item: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")
        
    existing_item = db.query(FarmInventory).filter(FarmInventory.id == id).first()

    if not existing_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Atualizar apenas os campos relevantes, mantendo o farm_id
    update_data = item.model_dump()
    for key, value in update_data.items():
        setattr(existing_item, key, value)

    # Garantir que farm_id permanece o mesmo
    setattr(existing_item, "farm_id", existing_item.farm_id)

    db.commit()
    db.refresh(existing_item)

    return existing_item


# DELETE /inventory/{id} - delete an item in the inventory
@router.delete("/{id}", status_code=204)
def delete_inventory_item(
    id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")
    
    item = db.query(FarmInventory).filter(FarmInventory.id == id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")

    db.delete(item)
    db.commit()
