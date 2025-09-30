from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.department import Department
# --- NEW IMPORTS for Point Features ---
from app.models.point_transaction import PointTransaction
from app.models.student_total import StudentTotal
# --------------------------------------
from app import schemas

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students

@router.get("/{student_identifier}", response_model=schemas.StudentResponse)
def get_student(student_identifier: str, db: Session = Depends(get_db)):
    """
    Retrieves a student using either their internal database ID (int)
    or their public-facing student_id (college roll number, str).
    """
    
    # Try to determine if the identifier is the internal DB ID (integer)
    is_db_id = False
    try:
        db_id = int(student_identifier)
        is_db_id = True
    except ValueError:
        pass

    if is_db_id:
        # Case 1: Search by internal database ID (Primary Key)
        student = db.query(Student).filter(Student.id == db_id).first()
    else:
        # Case 2: Search by the public-facing student_id (e.g., 'cs102')
        student = db.query(Student).filter(Student.student_id.ilike(student_identifier)).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found by ID or Roll Number")
    
    return student

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

@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(db_student)
    db.commit()
    return {"ok": True}

# -------------------- NEW ENDPOINT: POINTS TIMELINE --------------------
@router.get("/{student_id}/timeline", response_model=list[schemas.PointTransactionResponse])
def get_student_timeline(student_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the chronological list of all point transactions for a student.
    This powers the 'Points: Timeline' feature (Student Sidebar).
    """
    # 1. Verify student existence
    if not db.query(Student).filter(Student.id == student_id).first():
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Fetch all transactions, ordered by timestamp (newest first)
    transactions = db.query(PointTransaction).filter(
        PointTransaction.student_id == student_id
    ).order_by(
        PointTransaction.timestamp.desc()
    ).all()
    
    return transactions

# -------------------- NEW ENDPOINT: POINTS BREAKDOWN --------------------
@router.get("/{student_id}/breakdown", response_model=schemas.StudentTotalResponse)
def get_student_breakdown(student_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the aggregated point totals for a student.
    This powers the 'Points: Breakdown' feature (Student Sidebar).
    """
    # 1. Check for student total record (uses the efficient denormalized table)
    breakdown = db.query(StudentTotal).filter(
        StudentTotal.student_id == student_id
    ).first()
    
    # 2. Handle missing record or student
    if not breakdown:
        # Check if the student ID is valid at all
        if db.query(Student).filter(Student.id == student_id).first():
            # Student exists but has no transactions yet. Return zeroed default.
            return schemas.StudentTotalResponse(
                student_id=student_id, 
                academics_points=0, 
                sports_points=0, 
                cultural_points=0, 
                technical_points=0, 
                social_points=0, 
                composite_points=0
            )
        else:
            # Student ID is invalid
            raise HTTPException(status_code=404, detail="Student not found")

    return breakdown