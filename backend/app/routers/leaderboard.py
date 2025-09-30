from fastapi import APIRouter, Depends, HTTPException # Added HTTPException
from sqlalchemy.orm import Session, joinedload # Added joinedload for efficient relationship loading
from typing import List

from app.database import get_db
from app.models.student import Student
from app.models.student_total import StudentTotal
from app.models.department import Department # NEW IMPORT
from app.schemas import StudentResponse

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)

@router.get("/", response_model=List[StudentResponse])
def get_college_leaderboard(db: Session = Depends(get_db)):
    """
    Returns the college-wide leaderboard sorted by composite_points.
    The nested 'total' object is loaded for detailed point data.
    """
    # Query only the Student model, join with StudentTotal for ordering, and 
    # use joinedload to efficiently load the nested 'total' object and 'department'.
    leaderboard = db.query(Student).join(
        StudentTotal, Student.id == StudentTotal.student_id
    ).order_by(
        StudentTotal.composite_points.desc()
    ).options(
        joinedload(Student.department), # Eager load department details
        joinedload(Student.total)      # Eager load the StudentTotal record (the 'total' field)
    ).all()

    return leaderboard # Pydantic converts the list of Student objects into StudentResponse list

@router.get("/department/{department_id}", response_model=List[StudentResponse])
def get_department_leaderboard(department_id: int, db: Session = Depends(get_db)):
    """
    Returns the leaderboard for a specific department, sorted by composite_points.
    """
    # Verify Department exists before querying
    if not db.query(Department).filter(Department.id == department_id).first():
        raise HTTPException(status_code=404, detail="Department not found")

    leaderboard = db.query(Student).join(
        StudentTotal, Student.id == StudentTotal.student_id
    ).filter(
        Student.department_id == department_id  # Filter by department
    ).order_by(
        StudentTotal.composite_points.desc()
    ).options(
        joinedload(Student.department), # Eager load department details
        joinedload(Student.total)      # Eager load the StudentTotal record
    ).all()
    
    return leaderboard

@router.get("/class/{year}", response_model=List[StudentResponse])
def get_class_leaderboard(year: int, db: Session = Depends(get_db)):
    """
    Returns the leaderboard for a specific academic year (class), sorted by composite_points.
    """
    # No need to check for class/year existence; an empty list means no students in that year.
    leaderboard = db.query(Student).join(
        StudentTotal, Student.id == StudentTotal.student_id
    ).filter(
        Student.year == year  # Filter by academic year
    ).order_by(
        StudentTotal.composite_points.desc()
    ).options(
        joinedload(Student.department), # Eager load department details
        joinedload(Student.total)      # Eager load the StudentTotal record
    ).all()

    return leaderboard
