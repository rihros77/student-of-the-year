from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.student import Student
from app.models.point_transaction import PointTransaction
from app.schemas import StudentResponse

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)

@router.get("/", response_model=List[StudentResponse])
def get_leaderboard(db: Session = Depends(get_db)):
    """
    Returns a list of all students sorted by their total points in descending order.
    """
    # Sum points for each student
    leaderboard = db.query(
        Student,
        func.coalesce(func.sum(PointTransaction.points), 0).label("total_points")
    ).outerjoin(
        PointTransaction, Student.id == PointTransaction.student_id
    ).group_by(
        Student.id
    ).order_by(
        func.sum(PointTransaction.points).desc()
    ).all()

    # Prepare results
    result = []
    for student, total_points in leaderboard:
        student.points = total_points
        result.append(student)

    return result
