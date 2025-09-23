from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    points_awarded = Column(Integer, default=0)

    # Add this relationship
    point_transactions = relationship("PointTransaction", back_populates="event")
