from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.models.point_transaction import PointTransaction
from app.services.scoring_service import recalculate_student_totals
from app import schemas

router = APIRouter(prefix="/events", tags=["Events & Transactions"])

# ---------------------------
# GET ALL EVENTS
# ---------------------------
@router.get("/", response_model=list[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):
    """Retrieve all events"""
    return db.query(Event).all()

# ---------------------------
# GET SINGLE EVENT
# ---------------------------
@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

# ---------------------------
# CREATE EVENT
# ---------------------------
@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    try:
        db_event = Event(
            title=event.title,
            category=event.category,
            date=event.date,
            participation_points=event.participation_points,
            winner_points=event.winner_points,
            description=event.description if hasattr(event, "description") else None
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create event: {e}")

# ---------------------------
# UPDATE EVENT
# ---------------------------
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

# ---------------------------
# DELETE EVENT
# ---------------------------
@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Delete all associated point transactions first
    transactions = db.query(PointTransaction).filter(PointTransaction.event_id == event_id).all()
    for t in transactions:
        db.delete(t)
        recalculate_student_totals(db, t.student_id)

    db.delete(db_event)
    db.commit()
    return {"ok": True}

# ---------------------------
# AWARD POINTS
# ---------------------------
@router.post("/award_points", response_model=schemas.PointTransactionResponse, status_code=status.HTTP_201_CREATED)
def award_points(point_award: schemas.PointAward, db: Session = Depends(get_db)):
    """
    Award points to a student for a given event.
    """
    try:
        db_transaction = PointTransaction(
            student_id=point_award.student_id,
            event_id=point_award.event_id,
            points=point_award.points,
            category=point_award.category,
            reason=point_award.reason
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)

        # Recalculate student totals
        recalculate_student_totals(db, point_award.student_id)

        return db_transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {e}")

# ---------------------------
# DELETE SINGLE POINT TRANSACTION
# ---------------------------
@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(PointTransaction).filter(PointTransaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    student_id = db_transaction.student_id
    db.delete(db_transaction)
    db.commit()

    # Recalculate totals for this student
    recalculate_student_totals(db, student_id)

    return {"ok": True}

# ---------------------------
# DELETE ALL POINT TRANSACTIONS FOR A STUDENT
# ---------------------------
@router.delete("/transactions/student/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_all_transactions_for_student(student_id: int, db: Session = Depends(get_db)):
    db.query(PointTransaction).filter(PointTransaction.student_id == student_id).delete()
    db.commit()

    # Recalculate totals (will reset totals to 0)
    recalculate_student_totals(db, student_id)

    return {"ok": True}
