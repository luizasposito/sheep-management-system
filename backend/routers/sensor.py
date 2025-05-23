from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sensor import Sensor
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from schemas.sensor import SensorCreate, SensorResponse, SensorUpdate
from datetime import datetime

router = APIRouter()

# POST /sensor - criar sensor
@router.post("/", response_model=SensorResponse)
def create_sensor(
    sensor: SensorCreate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")
    if not current_user.farm_id:
        raise HTTPException(status_code=400, detail="User is not linked to any farm")

    data = sensor.model_dump()
    data["farm_id"] = current_user.farm_id
    data["timestamp"] = datetime.utcnow()

    new_sensor = Sensor(**data)
    db.add(new_sensor)
    db.commit()
    db.refresh(new_sensor)
    return new_sensor


# GET /sensor - listar sensores do farm
@router.get("/", response_model=List[SensorResponse])
def get_sensors(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")
    if not current_user.farm_id:
        raise HTTPException(status_code=400, detail="User is not linked to any farm")

    sensors = (
        db.query(Sensor)
        .filter(Sensor.farm_id == current_user.farm_id)
        .order_by(Sensor.name.asc())
        .all()
    )
    return sensors


# GET /sensor/{id} - obter sensor por id
@router.get("/{id}", response_model=SensorResponse)
def get_sensor(
    id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    sensor = db.query(Sensor).filter(Sensor.id == id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    if sensor.farm_id != current_user.farm_id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    return sensor


# PUT /sensor/{id} - atualizar sensor
@router.put("/{id}", response_model=SensorResponse)
def update_sensor(
    id: int,
    sensor_data: SensorUpdate,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    sensor = db.query(Sensor).filter(Sensor.id == id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    if sensor.farm_id != current_user.farm_id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    update_data = sensor_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sensor, key, value)

    db.commit()
    db.refresh(sensor)
    return sensor


# DELETE /sensor/{id} - deletar sensor
@router.delete("/{id}", status_code=204)
def delete_sensor(
    id: int,
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    sensor = db.query(Sensor).filter(Sensor.id == id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    if sensor.farm_id != current_user.farm_id:
        raise HTTPException(status_code=403, detail="Access forbidden")

    db.delete(sensor)
    db.commit()
