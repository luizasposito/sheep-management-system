from sqlalchemy import Column, Integer, String, ForeignKey, Float, TIMESTAMP, func
from database import Base

class FarmInventory(Base):
    __tablename__ = "farm_inventory"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)
    item_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    unit = Column(String(50), nullable=False)
    last_updated = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    consumption_rate = Column(Float, nullable=False, default=0)
    category = Column(String(99), nullable=False)