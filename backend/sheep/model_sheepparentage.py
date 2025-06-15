from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from database import Base
from sqlalchemy.orm import relationship

class SheepParentage(Base):
    __tablename__ = "sheep_parentage"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)
    offspring_id = Column(Integer, ForeignKey("sheep.id"), nullable=False)

    parent = relationship("Sheep", foreign_keys=[parent_id], back_populates="children")
    offspring = relationship("Sheep", foreign_keys=[offspring_id], back_populates="parents")

    __table_args__ = (
        UniqueConstraint('parent_id', 'offspring_id', name='_parent_offspring_uc'),
    )
