# app/models/student_total.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class StudentTotal(Base):
    """
    Denormalized table to store aggregated point totals for performance.
    It holds the running score for each student.
    """
    __tablename__ = "student_totals"

    # Links directly to the primary key of the students table
    # This acts as the primary key for the totals table
    student_id = Column(Integer, ForeignKey('students.id'), primary_key=True)
    
    # Points aggregated by category
    academics_points = Column(Integer, default=0, nullable=False)
    sports_points = Column(Integer, default=0, nullable=False)
    cultural_points = Column(Integer, default=0, nullable=False)
    technical_points = Column(Integer, default=0, nullable=False)
    social_points = Column(Integer, default=0, nullable=False)
    
    # Composite score used for the main leaderboard ranking
    composite_points = Column(Integer, default=0, nullable=False)
    
    # Timestamp to track when the totals were last updated
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    wins = Column(Integer, default=0)


    # Relationship back to Student model
    student = relationship("Student", back_populates="total", uselist=False)