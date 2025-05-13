from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey, func
from database import Base

class Appointment(Base):
    __tablename__ = "appointment"

    id = Column(Integer, primary_key=True, index=True)
    sheep_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)
    vet_id = Column(Integer, ForeignKey("veterinarian.id"), nullable=False)
    date = Column(TIMESTAMP, server_default=func.now())
    motivo = Column(Text, nullable=True)
    comentarios = Column(Text, nullable=True)
