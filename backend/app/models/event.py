from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)                # Event title
    category = Column(String, nullable=True)              # Sports, Cultural, etc.
    date = Column(DateTime, default=datetime.utcnow)      # Event date
    participation_points = Column(Integer, default=0)     # Points for participation
    winner_points = Column(Integer, default=0)            # Points for winners
    description = Column(Text, nullable=True)             # Description
