# app/models/final_snapshot.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from app.database import Base

class FinalSnapshot(Base):
    __tablename__ = "final_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    composite_points = Column(Integer, nullable=False)
    academics_points = Column(Integer, nullable=False)
    sports_points = Column(Integer, nullable=False)
    cultural_points = Column(Integer, nullable=False)
    technical_points = Column(Integer, nullable=False)
    social_points = Column(Integer, nullable=False)
    rank = Column(Integer, nullable=False)
    revealed = Column(Boolean, default=False)  # ✅ added revealed flag
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student")
