
from sqlalchemy import Column, Integer, String
from database import Base

class SensorType(Base):
    __tablename__ = "sensor_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    unit = Column(String(10), nullable=True)