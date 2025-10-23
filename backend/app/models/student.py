from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.department import Department

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True) 
    name = Column(String)
    department_id = Column(Integer, ForeignKey("departments.id"))
    year = Column(Integer)

    # Relationships
    department = relationship("Department")

    # ✅ ADDED/CONFIRMED: Relationship to point transactions (the activities/timeline)
    point_transactions = relationship("PointTransaction", back_populates="student")

    # ✅ CONFIRMED: Relationship to the calculated totals
    total = relationship("StudentTotal", back_populates="student", uselist=False)
    created_at = Column(DateTime, default=datetime.utcnow)  # ✅ Added