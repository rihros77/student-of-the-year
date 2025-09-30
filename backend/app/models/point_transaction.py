from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.student import Student
from app.models.event import Event

class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    points = Column(Integer)
    category = Column(String)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # ✅ Match schema

    student = relationship("Student", back_populates="point_transactions")
    event = relationship("Event")
