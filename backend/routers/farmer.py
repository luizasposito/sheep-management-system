
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.farmer import Farmer
from schemas.farmer import FarmerCreate, FarmerResponse

router = APIRouter()

# POST /farmer - create a new farmer
@router.post("/", response_model=FarmerResponse)
def create_farmer(farmer: FarmerCreate, db: Session = Depends(get_db)):
    # check if the email is already taken
    existing = db.query(Farmer).filter(Farmer.email == farmer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # create new farmer object
    new_farmer = Farmer(**farmer.model_dump())

    db.add(new_farmer)
    db.commit()
    db.refresh(new_farmer)

    return new_farmer




# GET /farmer/{id} - get farmer by id
@router.get("/{id}", response_model=FarmerResponse)
def get_farmer_by_id(id: int, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter(Farmer.id == id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer
