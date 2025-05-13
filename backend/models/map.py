from sqlalchemy import Column, Integer, String, ForeignKey, JSONB
from database import Base

class Map(Base):
    __tablename__ = "map"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    farm_id = Column(Integer, ForeignKey("farm.id"), unique=True)
    geojson_data = Column(JSONB)
