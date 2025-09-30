# app/models/student.py (Updated)
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.department import Department

class Student(Base):
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)  # college-roll
    name = Column(String)
    department_id = Column(Integer, ForeignKey("departments.id"))
    department = relationship("Department")
    year = Column(Integer)

    # Relationship for point transactions
    point_transactions = relationship("PointTransaction", back_populates="student")

    # 👇 ADD THIS LINE for the one-to-one relationship with StudentTotal
    total = relationship("StudentTotal", back_populates="student", uselist=False)