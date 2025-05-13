
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from fastapi.security import OAuth2PasswordBearer
from models.milk_production import MilkProduction
from models.farmer import Farmer
from models.sheep import Sheep
from models.farm import Farm
from sqlalchemy import func, text
from datetime import date
from routers.auth import get_current_user, get_db
from schemas.auth import TokenUser
from datetime import timedelta

router = APIRouter()

@router.get("/total-today")
async def get_total_milk_today(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)  # ainda retorna TokenUser
):
    today = date.today()

    # Buscar o Farmer completo usando o email do TokenUser
    farmer = db.query(Farmer).filter(Farmer.email == current_user.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Só considerar produção de ovelhas da fazenda do usuário
    total_volume = (
        db.query(func.sum(MilkProduction.volume))
        .join(Sheep, Sheep.id == MilkProduction.sheep_id)
        .filter(
            Sheep.farm_id == farmer.farm_id,
            MilkProduction.date == today
        )
        .scalar()
    )

    if total_volume is None:
        total_volume = 0.0

    return {
        "total_volume": round(total_volume, 2),
        "date": str(today)
    }




@router.get("/total-today-by-group")
async def get_total_today_by_group(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    from models.sheep_group import SheepGroup  # importar aqui, pois alguns testes dão erro de importação circular
    today = date.today()

    # Obter o fazendeiro com farm_id
    farmer = db.query(Farmer).filter(Farmer.email == current_user.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Join de ovelha -> grupo e somar volume
    results = (
        db.query(Sheep.group_id, func.sum(MilkProduction.volume).label("total_volume"))
        .join(MilkProduction, Sheep.id == MilkProduction.sheep_id)
        .filter(
            MilkProduction.date == today,
            Sheep.farm_id == farmer.farm_id,
            Sheep.group_id != None
        )
        .group_by(Sheep.group_id)
        .all()
    )

    response = []
    for row in results:
        group = db.query(SheepGroup).filter(SheepGroup.id == row.group_id).first()
        if group:
            response.append({
                "group_id": group.id,
                "group_name": group.name,
                "total_volume": round(row.total_volume, 2)
            })

    return response




@router.get("/total-last-7-days")
async def get_total_last_7_days(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    from models.sheep_group import SheepGroup  # importar aqui, para evitar problemas com importação circular
    today = date.today()
    start_date = today - timedelta(days=7)

    # Obter o fazendeiro com farm_id
    farmer = db.query(Farmer).filter(Farmer.email == current_user.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Obter as produções dos últimos 7 dias para cada grupo
    results = (
        db.query(Sheep.group_id, func.sum(MilkProduction.volume).label("total_volume"))
        .join(MilkProduction, Sheep.id == MilkProduction.sheep_id)
        .filter(
            MilkProduction.date >= start_date,
            MilkProduction.date <= today,
            Sheep.farm_id == farmer.farm_id,
            Sheep.group_id != None
        )
        .group_by(Sheep.group_id)
        .all()
    )

    response = []
    for row in results:
        group = db.query(SheepGroup).filter(SheepGroup.id == row.group_id).first()
        if group:
            response.append({
                "group_id": group.id,
                "group_name": group.name,
                "total_volume": round(row.total_volume, 2)
            })

    return response




@router.get("/total-week-before")
async def get_total_milk_week_before(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    # Buscar o fazendeiro e seu farm_id
    farmer = db.query(Farmer).filter(Farmer.email == current_user.email).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farm_id = farmer.farm_id

    today = date.today()
    start_date = today - timedelta(days=14)
    end_date = today - timedelta(days=7)

    result = (
        db.query(
            func.coalesce(func.sum(MilkProduction.volume), 0).label("total_volume"),
            Sheep.group_id
        )
        .join(Sheep, MilkProduction.sheep_id == Sheep.id)
        .filter(
            Sheep.farm_id == farm_id,
            MilkProduction.date >= start_date,
            MilkProduction.date < end_date
        )
        .group_by(Sheep.group_id)
        .all()
    )

    group_map = {}
    for row in db.execute(text("SELECT id, name FROM sheep_group WHERE farm_id = :fid"), {"fid": farm_id}):
        group_map[row.id] = row.name

    response = []
    for row in result:
        group_name = group_map.get(row.group_id, "Unknown Group")
        response.append({
            "group_id": row.group_id,
            "group_name": group_name,
            "total_volume": round(row.total_volume, 2)
        })

    return response



# Função para obter o total de produção de leite de ontem
@router.get("/total-yesterday")
async def get_total_yesterday(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # Obter o total de leite produzido ontem
    total_yesterday = db.query(MilkProduction).filter(MilkProduction.date == yesterday).all()

    # Se não houver dados, retornar 0 como volume
    total_volume = sum(record.volume for record in total_yesterday)

    # Retornar o total (mesmo que não haja dados, o volume será 0)
    return {
        "total_volume": total_volume,
        "date": str(yesterday)
    }