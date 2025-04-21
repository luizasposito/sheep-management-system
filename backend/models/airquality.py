
from sqlalchemy import Column, Integer, ForeignKey, Numeric, DateTime, func
from database import Base

class AirQualityMonitoring(Base):
    __tablename__ = "air_quality_monitoring"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)
    sensor_type_id = Column(Integer, ForeignKey("sensor_types.id"), nullable=False)
    low_threshold = Column(Numeric(5, 2))
    high_threshold = Column(Numeric(5, 2))
    current_value = Column(Numeric(5, 2), nullable=False)
    timestamp = Column(DateTime, server_default=func.now())
