from sqlalchemy import Column, Integer, ForeignKey
from database import Base

class SheepParentage(Base):
    __tablename__ = "sheep_parentage"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)
    offspring_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint('parent_id', 'offspring_id', name='_parent_offspring_uc'),
    )
