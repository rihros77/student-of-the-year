# routers/reveal.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.final_snapshot import FinalSnapshot
from app.models.student import Student
from app.schemas import StudentResponse, DepartmentResponse, StudentTotalResponse
from app.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/reveal", tags=["Reveal"])

@router.post("/", response_model=StudentResponse)
def final_reveal(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)  # ✅ only admin can reveal
):
    """
    Admin-only endpoint to reveal the Student of the Year.
    Sets 'revealed=True' on the winner snapshot.
    Returns the winner student details.
    """
    try:
        # Get the top-ranked snapshot
        winner_snapshot = db.query(FinalSnapshot).order_by(FinalSnapshot.rank.asc()).first()
        if not winner_snapshot:
            raise HTTPException(status_code=404, detail="No snapshot found. Create snapshot first.")

        # Mark snapshot as revealed
        winner_snapshot.revealed = True
        db.commit()
        db.refresh(winner_snapshot)

        # Fetch student details
        student = db.query(Student).filter(Student.id == winner_snapshot.student_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Winner student not found")

        # Prepare department response
        department_data = None
        if student.department:
            department_data = DepartmentResponse(
                id=student.department.id,
                name=student.department.name
            )

        # Prepare total points response
        total_data = None
        if student.total:
            total_data = StudentTotalResponse(
                student_id=student.total.student_id,
                academics_points=student.total.academics_points,
                sports_points=student.total.sports_points,
                cultural_points=student.total.cultural_points,
                technical_points=student.total.technical_points,
                social_points=student.total.social_points,
                composite_points=student.total.composite_points,
                wins=student.total.wins
            )

        return StudentResponse(
            id=student.id,
            student_id=student.student_id,
            name=student.name,
            year=student.year,
            department=department_data,
            total=total_data,
            point_transactions=[]  # optional, empty for reveal
        )

    except Exception as e:
        print("Error in final_reveal:", e)
        raise HTTPException(status_code=500, detail=str(e))
