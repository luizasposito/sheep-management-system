
from sqlalchemy import Column, Integer, ForeignKey, Date, Float
from database import Base
from sqlalchemy.orm import relationship

class MilkProduction(Base):
    __tablename__ = "milk_production_individual"

    id = Column(Integer, primary_key=True, index=True)
    sheep_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)
    date = Column(Date, nullable=False)
    volume = Column(Float(5, 2), nullable=False)

    sheep = relationship("Sheep", back_populates="milk_productions")