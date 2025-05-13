from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class Sheep(Base):
    __tablename__ = "sheep"

    id = Column(Integer, primary_key=True, index=True)
    birth_date = Column(Date)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)  # Relacionado com a fazenda
    feeding_hay = Column(Float(5, 2), nullable=False, default=0)
    feeding_feed = Column(Float(5, 2), nullable=False, default=0)
    gender = Column(String(10))
    status = Column(String(50))
    group_id = Column(Integer, ForeignKey("sheep_group.id"))  # Relacionado ao grupo de ovelhas

    milk_productions = relationship("MilkProduction", back_populates="sheep")