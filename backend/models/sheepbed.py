
from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, func
from database import Base

class SheepBed(Base):
    __tablename__ = "sheep_bed"

    id = Column(Integer, primary_key=True, index=True)
    sheep_id = Column(Integer, ForeignKey("sheep.id"), unique=True, nullable=False)
    location = Column(String(255), nullable=True)
    last_cleaned = Column(TIMESTAMP, server_default=func.now())
    cleaning_interval_days = Column(Integer, nullable=False, default=7)
