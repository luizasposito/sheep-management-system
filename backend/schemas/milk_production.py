
from pydantic import BaseModel, ConfigDict
from datetime import date

class MilkProductionCreate(BaseModel):
    sheep_id: int  # ID da ovelha
    date: date  # Data da produção de leite
    volume: float  # Volume de leite produzido

    model_config = ConfigDict(from_attributes=True)  # Permite que o Pydantic converta os modelos SQLAlchemy para Pydantic


class MilkProductionResponse(BaseModel):
    id: int  # ID do registro de produção de leite
    sheep_id: int  # ID da ovelha
    date: date  # Data da produção de leite
    volume: float  # Volume de leite produzido

    model_config = ConfigDict(from_attributes=True)


class MilkProductionUpdate(BaseModel):
    date: date  # Data da produção de leite
    volume: float  # Volume de leite produzido

    model_config = ConfigDict(from_attributes=True)
