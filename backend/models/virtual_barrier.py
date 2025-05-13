from sqlalchemy import Column, Integer, String, ForeignKey, JSONB
from database import Base

class VirtualBarrier(Base):
    __tablename__ = "virtual_barrier"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    map_id = Column(Integer, ForeignKey("map.id"), nullable=False)
    boundary_data = Column(JSONB)
