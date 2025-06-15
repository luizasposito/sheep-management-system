from sqlalchemy import Column, Integer, String, Text, ForeignKey
from database import Base

class SheepGroup(Base):
    __tablename__ = "sheep_group"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)