
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sheep import Sheep
from schemas.sheep import SheepCreate, SheepResponse
from typing import List

# router for all /sheep endpoints
router = APIRouter()

# POST /sheep - create a new sheep record
@router.post("/", response_model=SheepResponse)
def create_sheep(sheep: SheepCreate, db: Session = Depends(get_db)):
    # Convert Pydantic object into SQLAlchemy model
    new_sheep = Sheep(**sheep.model_dump())


    # Save to the database
    db.add(new_sheep)
    db.commit()
    db.refresh(new_sheep)  # Refresh to get the auto-generated ID

    return new_sheep  # FastAPI returns this as JSON using SheepResponse



# GET /sheep - return a list of all sheep
@router.get("/", response_model=List[SheepResponse])
def get_all_sheep(db: Session = Depends(get_db)):
    # Get all sheep from the database
    sheep_list = db.query(Sheep).all()
    return sheep_list



# GET /sheep/id - return specific sheep
@router.get("/{sheep_id}", response_model=SheepResponse)
def get_sheep_by_id(sheep_id: int, db: Session = Depends(get_db)):
    # Look for a sheep by its ID
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()

    # If not found, raise an error
    if sheep is None:
        raise HTTPException(status_code=404, detail="Sheep not found")

    return sheep
