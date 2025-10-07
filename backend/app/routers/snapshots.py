# routers/snapshots.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.student import Student
from app.models.student_total import StudentTotal
from app.models.final_snapshot import FinalSnapshot
from app.schemas import StudentResponse, FinalSnapshotResponse
from app.dependencies import get_current_admin_user
from app.models.user import User
from app.routers.leaderboard import attach_wins  # reuse existing tie-breaker logic

router = APIRouter(prefix="/snapshots", tags=["Snapshots"])

# --------------------------- Admin-only POST (create snapshot) ---------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_snapshot(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)  # ✅ only admin can call
):
    """
    Compute current leaderboard, assign ranks, and save immutable snapshot.
    Admin-only access. Snapshots start as revealed=False.
    """
    students = (
        db.query(Student)
        .join(StudentTotal, Student.id == StudentTotal.student_id)
        .order_by(
            StudentTotal.composite_points.desc(),
            StudentTotal.academics_points.desc(),
            StudentTotal.technical_points.desc(),
            Student.created_at.asc()
        )
        .all()
    )

    if not students:
        raise HTTPException(status_code=404, detail="No students found for snapshot")

    attach_wins(db, students)

    # Sort using tie-breaker
    students.sort(
        key=lambda s: (
            -(s.total.composite_points if s.total else 0),
            -(s.total.academics_points if s.total else 0),
            -(s.total.wins if s.total else 0),
            -(s.total.technical_points if s.total else 0),
            s.created_at
        )
    )

    # Save snapshots in a single transaction, initially hidden
    for idx, student in enumerate(students):
        snapshot = FinalSnapshot(
            student_id=student.id,
            composite_points=student.total.composite_points,
            academics_points=student.total.academics_points,
            sports_points=student.total.sports_points,
            cultural_points=student.total.cultural_points,
            technical_points=student.total.technical_points,
            social_points=student.total.social_points,
            rank=idx + 1,
            revealed=False  # ✅ initially hidden
        )
        db.add(snapshot)

    db.commit()
    return {"ok": True, "snapshots_created": len(students)}


# --------------------------- Public GET (non-admin view, only revealed) ---------------------------
@router.get("/", response_model=List[FinalSnapshotResponse])
def get_snapshots(db: Session = Depends(get_db)):
    """
    Non-admin students can view snapshots only if they are revealed.
    Before the reveal, this returns an empty list.
    """
    snapshots = db.query(FinalSnapshot).filter(FinalSnapshot.revealed == True).all()
    return snapshots
