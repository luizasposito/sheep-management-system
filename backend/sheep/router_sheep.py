
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from database import get_db
from sheep.model_sheep import Sheep
from farm.model_farm import Farm
from inventory.model_inventory import FarmInventory
from farmer.model_farmer import Farmer
from milkproduction.model_milkproduction import MilkProduction
from sheep.model_sheepparentage import SheepParentage
from sheep.schema_sheep import SheepCreate, SheepResponse, SheepUpdate
from milkproduction.schema_milkproduction import MilkProductionCreate, MilkProductionResponse, MilkProductionUpdate
from typing import List, Optional
from auth.router_auth import get_current_user
from auth.schema_auth import TokenUser
from pydantic import BaseModel
from database import SessionLocal
from datetime import date
from datetime import date as Date


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=SheepResponse)
def create_sheep(
    sheep: SheepCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    new_sheep_data = sheep.model_dump(exclude={"father_id", "mother_id"})
    new_sheep = Sheep(**new_sheep_data)
    db.add(new_sheep)
    db.commit()
    db.refresh(new_sheep)

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


@router.get("/", response_model=List[SheepResponse])
def get_all_sheep(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role not in ["farmer", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Access forbidden")

    sheep_list = db.query(Sheep).filter(Sheep.farm_id == current_user.farm_id).all()
    enriched_list = []

    for sheep in sheep_list:
        latest_milk = None
        if sheep.milk_productions:
            latest_milk = max(sheep.milk_productions, key=lambda m: m.date)

        sheep_data = {
            **sheep.__dict__,
            "milk_production": latest_milk.volume if latest_milk else None
        }
        enriched_list.append(sheep_data)

    return enriched_list


@router.get("/{sheep_id}", response_model=SheepResponse)
def get_sheep_by_id(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role not in ["farmer", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Access forbidden")

    sheep = (
        db.query(Sheep)
        .filter(Sheep.id == sheep_id, Sheep.farm_id == current_user.farm_id)
        .first()
    )

    if sheep is None:
        raise HTTPException(status_code=404, detail="Sheep not found")

    today = date.today()
    milk_today = (
        db.query(MilkProduction)
        .filter(MilkProduction.sheep_id == sheep_id, MilkProduction.date == today)
        .first()
    )

    father_id = None
    mother_id = None
    for rel in sheep.parents:
        parent = rel.parent
        if parent:
            gender = parent.gender.lower() if parent.gender else None
            if gender == "macho":
                father_id = parent.id
            elif gender == "fêmea":
                mother_id = parent.id

    sheep_data = {
        **sheep.__dict__,
        "father_id": father_id,
        "mother_id": mother_id,
        "milk_production": milk_today.volume if milk_today else None
    }

    return sheep_data


@router.put("/{sheep_id}", response_model=SheepResponse)
def update_sheep(
    sheep_id: int,
    data: SheepUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id, Sheep.farm_id == current_user.farm_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    for field, value in data.dict(exclude_unset=True).items():
        if field not in ["father_id", "mother_id"]:
            setattr(sheep, field, value)

    db.query(SheepParentage).filter(SheepParentage.offspring_id == sheep_id).delete()

    if data.father_id:
        parentage = SheepParentage(parent_id=data.father_id, offspring_id=sheep_id)
        db.add(parentage)
    if data.mother_id:
        parentage = SheepParentage(parent_id=data.mother_id, offspring_id=sheep_id)
        db.add(parentage)

    db.commit()
    db.refresh(sheep)
    return sheep


@router.delete("/{sheep_id}", status_code=204)
def delete_sheep(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id, Sheep.farm_id == current_user.farm_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    milk_productions = db.query(MilkProduction).filter(MilkProduction.sheep_id == sheep_id).all()
    for milk_production in milk_productions:
        db.delete(milk_production)

    db.delete(sheep)
    db.commit()
    return


@router.patch("/{sheep_id}/milk-yield")
async def update_milk_yield(
    sheep_id: int,
    milk_yield: MilkProductionUpdate = Body(...),
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if sheep.farm_id != current_user.farm_id:
        raise HTTPException(status_code=403, detail="Access forbidden: sheep does not belong to your farm")

    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

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


@router.get("/{sheep_id}/parents", response_model=List[SheepResponse])
def get_parents_of_sheep(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    parent_relations = db.query(SheepParentage).filter(SheepParentage.offspring_id == sheep_id).all()
    parent_sheep = [relation.parent for relation in parent_relations]

    return parent_sheep


@router.get("/{sheep_id}/children", response_model=List[SheepResponse])
def get_children_of_sheep(
    sheep_id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    child_relations = db.query(SheepParentage).filter(SheepParentage.parent_id == sheep_id).all()
    child_sheep = [relation.offspring for relation in child_relations]

    return child_sheep


@router.get("/{sheep_id}/milk-yield", response_model=List[MilkProductionResponse])
async def get_sheep_milk_production(
    sheep_id: int,
    date: Optional[Date] = Query(None, description="Data da produção no formato YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user),
):

    farmer = db.query(Farmer).filter(Farmer.email == current_user.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    sheep = db.query(Sheep).filter(Sheep.id == sheep_id, Sheep.farm_id == farmer.farm_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found or not authorized")

    query = db.query(MilkProduction).filter(MilkProduction.sheep_id == sheep_id)

    if date:
        query = query.filter(MilkProduction.date == date)

    productions = query.order_by(MilkProduction.date.desc()).all()

    return productions