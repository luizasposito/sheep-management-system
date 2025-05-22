
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models.sheep import Sheep
from models.farm import Farm
from models.farm_inventory import FarmInventory
from models.farmer import Farmer
from models.milk_production import MilkProduction
from models.sheep_parentage import SheepParentage
from schemas.sheep import SheepCreate, SheepResponse
from schemas.milk_production import MilkProductionCreate, MilkProductionResponse, MilkProductionUpdate
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from pydantic import BaseModel
from database import SessionLocal

# router for all /sheep endpoints
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# POST /sheep - create a new sheep record
@router.post("/", response_model=SheepResponse)
def create_sheep(
    sheep: SheepCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Cria a ovelha
    new_sheep_data = sheep.model_dump(exclude={"father_id", "mother_id"})
    new_sheep = Sheep(**new_sheep_data)
    db.add(new_sheep)
    db.commit()
    db.refresh(new_sheep)

    # Cria vínculos de paternidade/maternidade se existirem
    if sheep.father_id:
        father = db.query(Sheep).filter(Sheep.id == sheep.father_id).first()
        if not father:
            raise HTTPException(status_code=404, detail="Father not found")
        db.add(SheepParentage(parent_id=sheep.father_id, offspring_id=new_sheep.id))

    if sheep.mother_id:
        mother = db.query(Sheep).filter(Sheep.id == sheep.mother_id).first()
        if not mother:
            raise HTTPException(status_code=404, detail="Mother not found")
        db.add(SheepParentage(parent_id=sheep.mother_id, offspring_id=new_sheep.id))

    db.commit()

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
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # Remover a produção de leite associada
    milk_productions = db.query(MilkProduction).filter(MilkProduction.sheep_id == sheep_id).all()
    for milk_production in milk_productions:
        db.delete(milk_production)

    db.delete(sheep)
    db.commit()
    return




# Endpoint para atualizar o rendimento de leite
@router.patch("/{sheep_id}/milk-yield")
async def update_milk_yield(
    sheep_id: int,
    milk_yield: MilkProductionUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # Verifica se já existe uma produção de leite para a ovelha no mesmo dia
    existing_milk_production = db.query(MilkProduction).filter(
        MilkProduction.sheep_id == sheep_id,
        MilkProduction.date == milk_yield.date
    ).first()

    if existing_milk_production:
        existing_milk_production.volume = milk_yield.volume
        db.commit()
        db.refresh(existing_milk_production)
        return {
            "id": existing_milk_production.id,
            "milk_production": existing_milk_production.volume,
            "date": existing_milk_production.date
        }

    # Caso não exista produção de leite para o mesmo dia, cria uma nova entrada
    new_milk_production = MilkProduction(
        sheep_id=sheep_id,
        volume=milk_yield.volume,
        date=milk_yield.date
    )
    db.add(new_milk_production)
    db.commit()
    db.refresh(new_milk_production)

    return {
        "id": new_milk_production.id,
        "milk_production": new_milk_production.volume,
        "date": new_milk_production.date
    }




# GET /sheep/{id}/parents
@router.get("/{sheep_id}/parents", response_model=List[SheepResponse])
def get_parents_of_sheep(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # Buscar os pais (ovelhas onde sheep é o filho)
    parent_relations = db.query(SheepParentage).filter(SheepParentage.offspring_id == sheep_id).all()
    parent_sheep = [relation.parent for relation in parent_relations]

    return parent_sheep


# GET /sheep/{id}/children
@router.get("/{sheep_id}/children", response_model=List[SheepResponse])
def get_children_of_sheep(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # Buscar os filhos (ovelhas onde sheep é o pai/mãe)
    child_relations = db.query(SheepParentage).filter(SheepParentage.parent_id == sheep_id).all()
    child_sheep = [relation.offspring for relation in child_relations]

    return child_sheep
