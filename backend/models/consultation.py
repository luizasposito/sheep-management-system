
from sqlalchemy import Column, Integer, Text, Date, TIMESTAMP, ForeignKey, func
from database import Base

class Consultation(Base):
    __tablename__ = "consultation"

    id = Column(Integer, primary_key=True, index=True)
    sheep_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)
    vet_id = Column(Integer, ForeignKey("veterinarian.id"), nullable=False)
    date = Column(TIMESTAMP, server_default=func.now())
    diagnosis = Column(Text, nullable=True)
    treatment = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)