# app/routers/events.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List

from app.schemas import ParticipationLog
from app.database import get_db
from app.models.event import Event
from app.models.point_transaction import PointTransaction
from app.models.student import Student
from app.models.user import User
from app.services.scoring_service import recalculate_student_totals
from app import schemas
from app.dependencies import get_current_admin_user  # Admin-only dependency

router = APIRouter(prefix="/events", tags=["Events & Transactions"])

VALID_CATEGORIES = ["academics", "sports", "cultural", "technical", "social"]

# ---------------------------
# STATIC ROUTES FIRST
# ---------------------------

# ---------------------------
# GET PARTICIPATION LOGS (Admin-only)
# ---------------------------
# Temporary testing: remove admin dependency
@router.get("/participation_logs")
def get_participation_logs(db: Session = Depends(get_db)):
    logs = (
        db.query(PointTransaction, Student, Event)
        .join(Student, PointTransaction.student_id == Student.id)
        .join(Event, PointTransaction.event_id == Event.id)
        .filter(PointTransaction.reason == "Student opted to participate")
        .order_by(desc(PointTransaction.id))
        .limit(20)
        .all()
    )

    return [
        {
            "student_name": s.name,
            "event_title": e.title,
            "timestamp": str(p.created_at),
        }
        for p, s, e in logs
    ]


# ---------------------------
# STUDENT PARTICIPATION (no admin auth)
# ---------------------------
@router.post("/participate", status_code=status.HTTP_201_CREATED)
def participate_in_event(
    data: schemas.ParticipationRequest = Body(...),
    db: Session = Depends(get_db),
):
    student_id = data.student_id
    event_id = data.event_id

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing = (
        db.query(PointTransaction)
        .filter(
            PointTransaction.student_id == student_id,
            PointTransaction.event_id == event_id,
            PointTransaction.reason == "Student opted to participate",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")

    category = event.category if event.category in VALID_CATEGORIES else "academics"

    transaction = PointTransaction(
        student_id=student_id,
        event_id=event_id,
        points=0,
        category=category,
        reason="Student opted to participate",
    )
    db.add(transaction)
    db.commit()
    recalculate_student_totals(db, student_id)

    return {"message": "Participation registered successfully"}

# ---------------------------
# AWARD POINTS TO SINGLE STUDENT
# ---------------------------
@router.post("/award_points", response_model=schemas.PointTransactionResponse, status_code=status.HTTP_201_CREATED)
def award_points(
    point_award: schemas.PointAward,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    if point_award.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    event = db.query(Event).filter(Event.id == point_award.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    student = db.query(Student).filter(Student.id == point_award.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    transaction = PointTransaction(
        student_id=point_award.student_id,
        event_id=point_award.event_id,
        points=point_award.points,
        category=point_award.category,
        reason=point_award.reason,
        awarded_by=admin_user.id,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    recalculate_student_totals(db, point_award.student_id)
    return transaction

# ---------------------------
# AWARD POINTS IN BULK
# ---------------------------
@router.post("/award_points_bulk", status_code=status.HTTP_201_CREATED)
def award_points_bulk(
    student_ids: List[int] = Body(...),
    event_id: int = Body(...),
    points: int = Body(...),
    category: str = Body(...),
    reason: str = Body(...),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    awarded_students = []

    for student_id in student_ids:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            continue

        transaction = PointTransaction(
            student_id=student_id,
            event_id=event_id,
            points=points,
            category=category,
            reason=reason,
            awarded_by=admin_user.id,
        )
        db.add(transaction)
        db.flush()  # To get the ID if needed
        recalculate_student_totals(db, student_id)
        awarded_students.append(student_id)

    db.commit()
    return {"awarded_to": awarded_students, "points": points, "category": category}

# ---------------------------
# DELETE SINGLE POINT TRANSACTION
# ---------------------------
@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(PointTransaction).filter(PointTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    student_id = transaction.student_id
    db.delete(transaction)
    db.commit()
    recalculate_student_totals(db, student_id)
    return {"ok": True}

# ---------------------------
# DELETE ALL POINT TRANSACTIONS FOR A STUDENT
# ---------------------------
@router.delete("/transactions/student/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_transactions_for_student(student_id: int, db: Session = Depends(get_db)):
    db.query(PointTransaction).filter(PointTransaction.student_id == student_id).delete(synchronize_session="fetch")
    db.commit()
    recalculate_student_totals(db, student_id)
    return {"ok": True}

# ---------------------------
# CRUD FOR EVENTS (DYNAMIC ROUTES LAST)
# ---------------------------

@router.get("/", response_model=list[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    if event.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    db_event = Event(
        title=event.title,
        category=event.category,
        date=event.date,
        participation_points=event.participation_points,
        winner_points=event.winner_points,
        description=getattr(event, "description", None),
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(db_event, key):
            setattr(db_event, key, value)

    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete associated point transactions first
    transactions = db.query(PointTransaction).filter(PointTransaction.event_id == event_id).all()
    for t in transactions:
        db.delete(t)
        recalculate_student_totals(db, t.student_id)

    db.delete(db_event)
    db.commit()
    return {"ok": True}
