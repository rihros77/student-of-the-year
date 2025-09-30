from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.student import Student
from app.models.student_total import StudentTotal # <-- NEW IMPORT
from app.schemas import StudentResponse

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)

@router.get("/", response_model=List[StudentResponse])
def get_college_leaderboard(db: Session = Depends(get_db)):
    """
    Returns the college-wide leaderboard sorted by composite_points.
    Reads from the efficient StudentTotal table.
    """
    # Query: Select Student and their composite points
    leaderboard = db.query(
        Student,
        StudentTotal.composite_points
    ).join(
        StudentTotal, Student.id == StudentTotal.student_id # JOIN with the totals table
    ).order_by(
        StudentTotal.composite_points.desc() # Sort by the pre-calculated score
    ).all()

    # Prepare results for the Pydantic schema
    result = []
    for student_model, total_points in leaderboard:
        # Pydantic schema expects a 'points' field, so we set it dynamically
        student_model.points = total_points 
        result.append(student_model)

    return result
