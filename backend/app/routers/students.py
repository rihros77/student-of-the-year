from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.student import Student
from app.models.department import Department
from app.models.point_transaction import PointTransaction
from app.models.student_total import StudentTotal
from app import schemas

router = APIRouter(prefix="/students", tags=["students"])

# -------------------- GET ALL STUDENTS --------------------
@router.get("/", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students

# -------------------- GET STUDENT (with totals + transactions) --------------------
@router.get("/{student_identifier}", response_model=schemas.StudentResponse)
def get_student(student_identifier: str, db: Session = Depends(get_db)):
    """
    Retrieves a student using either their internal database ID or roll number.
    Eagerly loads their total points and recent point transactions for dashboard/profile display.
    """
    # Try to parse identifier as DB ID
    is_db_id = False
    try:
        db_id = int(student_identifier)
        is_db_id = True
    except ValueError:
        pass

    # Build base query with eager loading
    query = db.query(Student).options(
        joinedload(Student.total),  # eager load StudentTotal
        joinedload(Student.point_transactions)  # eager load transactions
    )

    # Filter by ID or roll number
    if is_db_id:
        student = query.filter(Student.id == db_id).first()
    else:
        student = query.filter(Student.student_id.ilike(student_identifier)).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found by ID or Roll Number")

    # Sort and limit point_transactions manually (since joinedload doesn't support .limit/.order_by)
    student.point_transactions.sort(key=lambda x: x.created_at or 0, reverse=True)
    student.point_transactions = student.point_transactions[:10]  # Limit to 10 recent

    return student

# -------------------- CREATE STUDENT --------------------
@router.post("/", response_model=schemas.StudentResponse, status_code=201)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_department = db.query(Department).filter(Department.id == student.department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")

    db_student = Student(
        student_id=student.student_id,
        name=student.name,
        department_id=student.department_id,
        year=student.year,
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

# -------------------- UPDATE STUDENT --------------------
@router.put("/{student_id}", response_model=schemas.StudentResponse)
def update_student(student_id: int, student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db_department = db.query(Department).filter(Department.id == student.department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")

    db_student.student_id = student.student_id
    db_student.name = student.name
    db_student.year = student.year
    db_student.department_id = student.department_id
    db.commit()
    db.refresh(db_student)
    return db_student

# -------------------- DELETE STUDENT --------------------
@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()
    return {"ok": True}

# -------------------- POINTS TIMELINE --------------------
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

# -------------------- POINTS BREAKDOWN --------------------
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
        else:
            raise HTTPException(status_code=404, detail="Student not found")

    return breakdown
