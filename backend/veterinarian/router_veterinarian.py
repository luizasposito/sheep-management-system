
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from veterinarian.model_veterinarian import Veterinarian
from veterinarian.schema_veterinarian import VeterinarianCreate, VeterinarianResponse

router = APIRouter()

# PUT /veterinarian - add veterinarian account
@router.post("/", response_model=VeterinarianResponse)
def create_veterinarian(vet: VeterinarianCreate, db: Session = Depends(get_db)):
    # check if email already exists
    existing = db.query(Veterinarian).filter(Veterinarian.email == vet.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_vet = Veterinarian(**vet.model_dump())
    db.add(new_vet)
    db.commit()
    db.refresh(new_vet)
    return new_vet




# GET /veterinarian/{id} - get veterinarian by id
@router.get("/{vet_id}", response_model=VeterinarianResponse)
def get_veterinarian(vet_id: int, db: Session = Depends(get_db)):
    vet = db.query(Veterinarian).filter(Veterinarian.id == vet_id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinarian not found")
    return vet




# PUT /veterinarian/{id} - update veterinarian by id
@router.put("/{vet_id}", response_model=VeterinarianResponse)
def update_veterinarian(vet_id: int, updated_vet: VeterinarianCreate, db: Session = Depends(get_db)):
    vet = db.query(Veterinarian).filter(Veterinarian.id == vet_id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Veterinarian not found")

    for key, value in updated_vet.dict().items():
        setattr(vet, key, value)

    db.commit()
    db.refresh(vet)
    return vet
