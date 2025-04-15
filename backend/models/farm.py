from sqlalchemy import Column, Integer, String, Text
from database import Base

class Farm(Base):
    __tablename__ = "farm"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    location = Column(Text)
