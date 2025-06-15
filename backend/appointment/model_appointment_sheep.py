
from sqlalchemy import Column, Integer, ForeignKey, Table
from database import Base

appointment_sheep = Table(
    "appointment_sheep",
    Base.metadata,
    Column("appointment_id", Integer, ForeignKey("appointment.id"), primary_key=True),
    Column("sheep_id", Integer, ForeignKey("sheep.id"), primary_key=True)
)
