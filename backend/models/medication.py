
from sqlalchemy import Column, Integer, ForeignKey, String, Text
from database import Base

class Medication(Base):
    __tablename__ = "medication"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointment.id"), nullable=False)
    name = Column(String(255), nullable=False)
    dosage = Column(String(100))
    indication = Column(Text)
