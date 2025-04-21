
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.consultation import Consultation
from models.sheep import Sheep
from models.farm import Farm
from models.farmer import Farmer
from models.airquality import AirQualityMonitoring
from models.sensortype import SensorType
from schemas.airquality import AirQualityResponse, SensorTypeResponse, SensorTypeSchema
from typing import List
from routers.auth import get_current_user
from schemas.auth import TokenUser
from datetime import date


router = APIRouter()


# GET /airquality - get all of the information regarding air quality
@router.get("/current", response_model=list[AirQualityResponse])
def get_current_air_quality(
    db: Session = Depends(get_db),
    current_user: TokenUser = Depends(get_current_user)
):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Buscar o farm_id do usuário diretamente no banco de dados
    user = db.query(Farmer).filter(Farmer.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farm_id = user.farm_id  # Agora temos o farm_id

    # Subquery para pegar o timestamp mais recente por tipo de sensor
    subquery = (
        db.query(
            AirQualityMonitoring.sensor_type_id,
            func.max(AirQualityMonitoring.timestamp).label("max_time")
        )
        .filter(AirQualityMonitoring.farm_id == farm_id)  # Usando o farm_id obtido
        .group_by(AirQualityMonitoring.sensor_type_id)
        .subquery()
    )

    # Join da subquery com as leituras reais e os tipos de sensor
    latest_readings = (
        db.query(AirQualityMonitoring)
        .join(
            subquery,
            (AirQualityMonitoring.sensor_type_id == subquery.c.sensor_type_id) &
            (AirQualityMonitoring.timestamp == subquery.c.max_time)
        )
        .join(SensorType, SensorType.id == AirQualityMonitoring.sensor_type_id)
        .filter(AirQualityMonitoring.farm_id == farm_id)  # Usando o farm_id aqui também
        .all()
    )

    if not latest_readings:
        raise HTTPException(status_code=404, detail="No air quality data found")

    # Transformando os dados para o formato esperado pelo Pydantic
    response_data = [
        AirQualityResponse(
            sensor_type=SensorTypeResponse(
                id=reading.sensor_type.id,
                name=reading.sensor_type.name,
                unit=reading.sensor_type.unit
            ),
            current_value=reading.current_value,
            low_threshold=reading.low_threshold,
            high_threshold=reading.high_threshold,
            timestamp=reading.timestamp.isoformat()  # Se precisar converter para string
        )
        for reading in latest_readings
    ]

    return response_data