from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Veterinarian(Base):
    __tablename__ = "veterinarian"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String, nullable=False)
    farm_id = Column(Integer, ForeignKey("farm.id"), nullable=False)  # Relacionado com a fazenda
    farmer_id = Column(Integer, ForeignKey("farmer.id"), nullable=False)  # Relacionado com o agricultor
