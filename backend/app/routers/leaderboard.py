# routers/leaderboard.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.student import Student
from app.models.student_total import StudentTotal
from app.models.department import Department
from app.models.point_transaction import PointTransaction
from app.schemas import StudentResponse, StudentTotalResponse

router = APIRouter(
    prefix="/leaderboard",
    tags=["Leaderboard"]
)

def attach_wins(db: Session, students: List[Student]):
    """
    Compute wins for each student and attach to the student's total object.
    Wins are the number of point_transactions with reason='winner'.
    """
    student_ids = [s.id for s in students]
    if not student_ids:
        return

    # Query wins per student
    wins_subq = (
        db.query(
            PointTransaction.student_id,
            func.count(PointTransaction.id).label("wins")
        )
        .filter(PointTransaction.student_id.in_(student_ids))
        .filter(PointTransaction.reason == "winner")
        .group_by(PointTransaction.student_id)
        .all()
    )
    wins_dict = {student_id: wins for student_id, wins in wins_subq}

    for s in students:
        if s.total:
            s.total.wins = wins_dict.get(s.id, 0)

# --------------------------- College Leaderboard ---------------------------
@router.get("/", response_model=List[StudentResponse])
def get_college_leaderboard(db: Session = Depends(get_db)):
    students = (
        db.query(Student)
        .join(StudentTotal, Student.id == StudentTotal.student_id)
        .order_by(
            StudentTotal.composite_points.desc(),
            StudentTotal.academics_points.desc(),
            # Wins handled dynamically below
            StudentTotal.technical_points.desc(),
            Student.created_at.asc()
        )
        .options(
            joinedload(Student.department),
            joinedload(Student.total),
            joinedload(Student.point_transactions)
        )
        .all()
    )

    attach_wins(db, students)
    # Re-sort using wins dynamically for tie-breaker
    students.sort(
        key=lambda s: (
            -(s.total.composite_points if s.total else 0),
            -(s.total.academics_points if s.total else 0),
            -(s.total.wins if s.total else 0),
            -(s.total.technical_points if s.total else 0),
            s.created_at
        )
    )

    return students

# --------------------------- Department Leaderboard ---------------------------
@router.get("/department/{department_id}", response_model=List[StudentResponse])
def get_department_leaderboard(department_id: int, db: Session = Depends(get_db)):
    if not db.query(Department).filter(Department.id == department_id).first():
        raise HTTPException(status_code=404, detail="Department not found")

    students = (
        db.query(Student)
        .join(StudentTotal, Student.id == StudentTotal.student_id)
        .filter(Student.department_id == department_id)
        .order_by(
            StudentTotal.composite_points.desc(),
            StudentTotal.academics_points.desc(),
            StudentTotal.technical_points.desc(),
            Student.created_at.asc()
        )
        .options(
            joinedload(Student.department),
            joinedload(Student.total),
            joinedload(Student.point_transactions)
        )
        .all()
    )

    attach_wins(db, students)
    students.sort(
        key=lambda s: (
            -(s.total.composite_points if s.total else 0),
            -(s.total.academics_points if s.total else 0),
            -(s.total.wins if s.total else 0),
            -(s.total.technical_points if s.total else 0),
            s.created_at
        )
    )

    return students

# --------------------------- Class (Year) Leaderboard ---------------------------
@router.get("/class/{year}", response_model=List[StudentResponse])
def get_class_leaderboard(year: int, db: Session = Depends(get_db)):
    students = (
        db.query(Student)
        .join(StudentTotal, Student.id == StudentTotal.student_id)
        .filter(Student.year == year)
        .order_by(
            StudentTotal.composite_points.desc(),
            StudentTotal.academics_points.desc(),
            StudentTotal.technical_points.desc(),
            Student.created_at.asc()
        )
        .options(
            joinedload(Student.department),
            joinedload(Student.total),
            joinedload(Student.point_transactions)
        )
        .all()
    )

    attach_wins(db, students)
    students.sort(
        key=lambda s: (
            -(s.total.composite_points if s.total else 0),
            -(s.total.academics_points if s.total else 0),
            -(s.total.wins if s.total else 0),
            -(s.total.technical_points if s.total else 0),
            s.created_at
        )
    )

    return students
