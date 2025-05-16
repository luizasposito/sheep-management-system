
from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP, func
from database import Base

class Sensor(Base):
    __tablename__ = "sensor"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)
    name = Column(String(100), nullable=False)
    min_value = Column(Float(5, 2))
    max_value = Column(Float(5, 2))
    current_value = Column(Float(5, 2), nullable=False)
    timestamp = Column(TIMESTAMP, server_default=func.now())
