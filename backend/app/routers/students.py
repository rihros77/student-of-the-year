from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.student import Student
from app.models.department import Department
from app import schemas

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/", response_model=list[schemas.StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return students

@router.get("/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
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
