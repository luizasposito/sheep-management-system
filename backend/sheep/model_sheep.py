from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from database import Base
from sqlalchemy.orm import relationship
from typing import Optional
from appointment.model_appointment_sheep import appointment_sheep

class Sheep(Base):
    __tablename__ = "sheep"

    id = Column(Integer, primary_key=True, index=True)
    birth_date = Column(Date)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)
    feeding_hay = Column(Float(5, 2), nullable=False, default=0)
    feeding_feed = Column(Float(5, 2), nullable=False, default=0)
    gender = Column(String(10))
    group_id = Column(Integer, ForeignKey("sheep_group.id"))

    milk_productions = relationship("MilkProduction", back_populates="sheep")
    appointments = relationship("Appointment", secondary=appointment_sheep, back_populates="sheeps")

    children = relationship(
        "SheepParentage",
        foreign_keys="[SheepParentage.parent_id]",
        back_populates="parent"
    )

    parents = relationship(
        "SheepParentage",
        foreign_keys="[SheepParentage.offspring_id]",
        back_populates="offspring"
    )