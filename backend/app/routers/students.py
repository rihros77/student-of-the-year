from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.student import Student
from app.models.department import Department
from app.models.point_transaction import PointTransaction
from app.models.student_total import StudentTotal
from app import schemas

router = APIRouter(prefix="/students", tags=["Students"])

# ------------------------------------------------------------
#  GET ALL STUDENTS
# ------------------------------------------------------------
@router.get("/", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

# ------------------------------------------------------------
#  GET SINGLE STUDENT (with totals + last 10 transactions)
# ------------------------------------------------------------
@router.get("/{student_identifier}", response_model=schemas.StudentResponse)
def get_student(student_identifier: str, db: Session = Depends(get_db)):
    """
    Retrieve a student by either database ID or roll number.
    Includes total points and last 10 transactions.
    """
    try:
        db_id = int(student_identifier)
        filter_condition = Student.id == db_id
    except ValueError:
        filter_condition = Student.student_id == student_identifier

    student = (
        db.query(Student)
        .options(
            joinedload(Student.total),
            joinedload(Student.point_transactions)
        )
        .filter(filter_condition)
        .first()
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Sort last 10 transactions
    student.point_transactions.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
    student.point_transactions = student.point_transactions[:10]
    return student

# ------------------------------------------------------------
#  CREATE STUDENT
# ------------------------------------------------------------
@router.post("/", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    if db.query(Student).filter(Student.student_id == student.student_id).first():
        raise HTTPException(status_code=400, detail="Student ID already exists")

    department = db.query(Department).filter(Department.id == student.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    new_student = Student(
        student_id=student.student_id,
        name=student.name,
        year=student.year,
        department_id=student.department_id
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

# ------------------------------------------------------------
#  UPDATE STUDENT
# ------------------------------------------------------------
@router.put("/{student_id}", response_model=schemas.StudentResponse)
def update_student(student_id: int, student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    department = db.query(Department).filter(Department.id == student.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    db_student.name = student.name
    db_student.student_id = student.student_id
    db_student.year = student.year
    db_student.department_id = student.department_id

    db.commit()
    db.refresh(db_student)
    return db_student

# ------------------------------------------------------------
#  DELETE STUDENT
# ------------------------------------------------------------
@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# ------------------------------------------------------------
#  POINTS TIMELINE
# ------------------------------------------------------------
@router.get("/{student_id}/timeline", response_model=list[schemas.PointTransactionResponse])
def get_student_timeline(student_id: int, db: Session = Depends(get_db)):
    if not db.query(Student).filter(Student.id == student_id).first():
        raise HTTPException(status_code=404, detail="Student not found")

    transactions = (
        db.query(PointTransaction)
        .filter(PointTransaction.student_id == student_id)
        .order_by(PointTransaction.created_at.desc())
        .all()
    )
    return transactions

# ------------------------------------------------------------
#  POINTS BREAKDOWN
# ------------------------------------------------------------
@router.get("/{student_id}/breakdown", response_model=schemas.StudentTotalResponse)
def get_student_breakdown(student_id: int, db: Session = Depends(get_db)):
    breakdown = db.query(StudentTotal).filter(StudentTotal.student_id == student_id).first()

    if not breakdown:
        if db.query(Student).filter(Student.id == student_id).first():
            return schemas.StudentTotalResponse(
                student_id=student_id,
                academics_points=0,
                sports_points=0,
                cultural_points=0,
                technical_points=0,
                social_points=0,
                composite_points=0,
            )
        raise HTTPException(status_code=404, detail="Student not found")
    return breakdown

# ------------------------------------------------------------
#  ACHIEVEMENTS
# ------------------------------------------------------------
@router.get("/{student_id}/achievements", response_model=list[schemas.AchievementResponse])
def get_student_achievements(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    transactions = (
        db.query(PointTransaction)
        .filter(PointTransaction.student_id == student_id)
        .order_by(PointTransaction.created_at.desc())
        .all()
    )

    achievements = []
    for t in transactions:
        achievements.append(
            schemas.AchievementResponse(
                id=t.id,
                title=t.reason or "Achievement",
                description=t.reason or "",
                category=t.category or "General",
                event_id=t.event_id,
                points=t.points or 0,
                date=t.created_at or datetime.utcnow(),
                position=getattr(t, "position", None),
            )
        )

    return achievements
