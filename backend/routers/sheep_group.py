
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.sheep import Sheep
from models.farm import Farm
from models.farm_inventory import FarmInventory
from models.farmer import Farmer
from schemas.sheep import SheepCreate, SheepResponse
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from schemas.sheep import SheepResponse
from pydantic import BaseModel
from models.sheep_group import SheepGroup
from schemas.sheep_group import SheepGroupCreate, SheepGroupResponse
from typing import Optional

router = APIRouter()

@router.post("", response_model=SheepGroupResponse)
def create_sheep_group(
    group: SheepGroupCreate,
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    sheep_group = SheepGroup(
        name=group.name,
        description=group.description,
        farm_id=farmer.farm_id
    )
    db.add(sheep_group)
    db.commit()
    db.refresh(sheep_group)

    # Atualiza as ovelhas com esse group_id
    if group.sheep_ids:
        db.query(Sheep).filter(
            Sheep.id.in_(group.sheep_ids),
            Sheep.farm_id == farmer.farm_id
        ).update({"group_id": sheep_group.id}, synchronize_session=False)
        db.commit()

    return sheep_group



@router.get("", response_model=List[SheepGroupResponse])
def get_sheep_groups(
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    groups = db.query(SheepGroup).filter(SheepGroup.farm_id == farmer.farm_id).all()
    return groups



@router.get("/{group_id}", response_model=SheepGroupResponse)
def get_sheep_group_by_id(
    group_id: int,
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()

    group = db.query(SheepGroup).filter(
        SheepGroup.id == group_id,
        SheepGroup.farm_id == farmer.farm_id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Sheep group not found")

    return group




@router.put("/{group_id}", response_model=SheepGroupResponse)
def update_sheep_group(
    group_id: int,
    group_data: SheepGroupCreate,  # Ou crie um `SheepGroupUpdate` schema se quiser campos opcionais
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()

    group = db.query(SheepGroup).filter(
        SheepGroup.id == group_id,
        SheepGroup.farm_id == farmer.farm_id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Sheep group not found")

    group.name = group_data.name
    group.description = group_data.description

    db.commit()
    db.refresh(group)
    return group




@router.delete("/{group_id}")
def delete_sheep_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()

    group = db.query(SheepGroup).filter(
        SheepGroup.id == group_id,
        SheepGroup.farm_id == farmer.farm_id
    ).first()

    if not group:
        raise HTTPException(status_code=404, detail="Sheep group not found")

    db.delete(group)
    db.commit()
    return {"message": "Sheep group deleted successfully"}



@router.get("/{group_id}/count", response_model=int)
def count_sheep_in_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    # Verifica se o grupo pertence ao fazendeiro
    group = db.query(SheepGroup).filter(
        SheepGroup.id == group_id,
        SheepGroup.farm_id == current_farmer.farm_id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Sheep group not found")

    count = db.query(Sheep).filter(Sheep.group_id == group_id).count()
    return count



@router.get("/sheep-count-by-group")
def get_sheep_count_by_group(
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_farmer.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    result = (
        db.query(Sheep.group_id, func.count(Sheep.id).label("count"))
        .filter(Sheep.farm_id == farmer.farm_id, Sheep.group_id != None)
        .group_by(Sheep.group_id)
        .all()
    )

    group_map = {
        g.id: g.name
        for g in db.query(SheepGroup).filter(SheepGroup.farm_id == farmer.farm_id)
    }

    response = [
        {"group_name": group_map.get(r.group_id, "Sem Nome"), "count": r.count}
        for r in result
    ]

    return response



@router.get("/{group_id}/sheep", response_model=List[SheepResponse])
def get_sheep_in_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_farmer = Depends(get_current_user)
):
    group = db.query(SheepGroup).filter(
        SheepGroup.id == group_id,
        SheepGroup.farm_id == current_farmer.farm_id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Sheep group not found")

    sheep_list = db.query(Sheep).filter(Sheep.group_id == group_id).all()
    return sheep_list



@router.patch("/{sheep_id}/change-group")
def change_sheep_group(
    sheep_id: int,
    new_group_id: Optional[int] = Body(None, embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    sheep = db.query(Sheep).filter(Sheep.id == sheep_id).first()
    if not sheep:
        raise HTTPException(status_code=404, detail="Sheep not found")

    # Verifica se a ovelha pertence à fazenda do usuário
    if sheep.farm_id != current_user.farm_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    if new_group_id is not None:
        group = db.query(SheepGroup).filter(
            SheepGroup.id == new_group_id,
            SheepGroup.farm_id == current_user.farm_id
        ).first()
        if not group:
            raise HTTPException(status_code=404, detail="Sheep group not found")

    sheep.group_id = new_group_id
    db.commit()
    db.refresh(sheep)
    return {"message": f"Sheep {sheep.id} moved to group {new_group_id}"}






@router.patch("/{group_id}/update-sheep")
def update_sheep_in_group(
    group_id: int,
    sheep_ids: List[int] = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    farmer = db.query(Farmer).filter(Farmer.email == current_user.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    group = db.query(SheepGroup).filter(
        SheepGroup.id == group_id,
        SheepGroup.farm_id == farmer.farm_id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Remove todas as ovelhas do grupo
    db.query(Sheep).filter(
        Sheep.group_id == group_id,
        Sheep.farm_id == farmer.farm_id
    ).update({ "group_id": None }, synchronize_session=False)

    # Adiciona as novas ovelhas ao grupo
    db.query(Sheep).filter(
        Sheep.id.in_(sheep_ids),
        Sheep.farm_id == farmer.farm_id
    ).update({ "group_id": group_id }, synchronize_session=False)

    db.commit()
    return {"message": f"Group {group_id} sheep updated"}
