
from sqlalchemy import Column, Integer, String, Date, DECIMAL
from database import Base  # Base class used by SQLAlchemy to define tables

# maps the 'sheep' table in db
class Sheep(Base):
    __tablename__ = "sheep"  # Table name in the database

    id = Column(Integer, primary_key=True, index=True)  # Auto-incrementing ID
    birth_date = Column(Date)
    farm_id = Column(Integer, nullable=False)
    milk_production = Column(DECIMAL(5, 2))
    feeding_hay = Column(DECIMAL(5, 2), nullable=False, default=0)
    feeding_feed = Column(DECIMAL(5, 2), nullable=False, default=0)
    gender = Column(String(10))
    status = Column(String(50))
