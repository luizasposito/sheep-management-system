
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sheep import Sheep
from models.farm import Farm
from models.sensor import Sensor
from models.farmer import Farmer
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from schemas.sensor import SensorBase, SensorCreate, SensorResponse, SensorUpdate
from pydantic import BaseModel

router = APIRouter()


@router.post("/", response_model=SensorResponse)
async def create_sensor(sensor: SensorCreate, db: Session = Depends(get_db)):
    # Criando o objeto Sensor a partir do schema de entrada
    new_sensor = Sensor(
        name=sensor.name,
        min_value=sensor.min_value,
        max_value=sensor.max_value,
        current_value=sensor.current_value,
        unit=sensor.unit,
        farm_id=1  # Aqui pode ser modificado para o farm_id do usuário autenticado
    )
    
    # Adicionando e salvando no banco
    db.add(new_sensor)
    db.commit()
    db.refresh(new_sensor)  # Para garantir que o objeto tenha o id e timestamp gerados
    
    return new_sensor


@router.get("/", response_model=List[SensorResponse])
async def get_sensors(db: Session = Depends(get_db)):
    sensors = db.query(Sensor).all()  # Obtendo todos os sensores do banco
    return sensors