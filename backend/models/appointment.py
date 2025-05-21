from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey, func
from database import Base
from sqlalchemy.orm import relationship
from models.appointment_sheep import appointment_sheep
from models.medication import Medication

class Appointment(Base):
    __tablename__ = "appointment"

    id = Column(Integer, primary_key=True, index=True)
    vet_id = Column(Integer, ForeignKey("veterinarian.id"), nullable=False)
    date = Column(TIMESTAMP, server_default=func.now())
    motivo = Column(Text, nullable=True)
    comentarios = Column(Text, nullable=True)

    # Novo relacionamento N:N
    sheeps = relationship("Sheep", secondary=appointment_sheep, back_populates="appointments")
    medications = relationship("Medication", backref="appointment", cascade="all, delete-orphan")