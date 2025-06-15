
from sqlalchemy import Column, Integer, String
from database import Base

class Farmer(Base):
    __tablename__ = "farmer"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String, nullable=False)
    farm_id = Column(Integer, nullable=False, unique=True)  # assuming one farmer per farm
