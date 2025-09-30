from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.models.point_transaction import PointTransaction
from app.services.scoring_service import recalculate_student_totals # <-- NEW IMPORT
from app import schemas

router = APIRouter(prefix="/events", tags=["Events & Transactions"])

@router.get("/", response_model=list[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    return events

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.post("/award_points", response_model=schemas.PointTransactionResponse, status_code=status.HTTP_201_CREATED)
def award_points(point_award: schemas.PointAward, db: Session = Depends(get_db)):
    """
    Creates a new point transaction (audit record) and then updates the student's totals table.
    """
    
    # 1. Create the point transaction (Audit Record)
    db_transaction = PointTransaction(
        student_id=point_award.student_id,
        event_id=point_award.event_id,
        points=point_award.points,
        category=point_award.category,
        reason=point_award.reason
    )
    db.add(db_transaction)
    
    try:
        db.commit()
        db.refresh(db_transaction)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed: {e}"
        )
    
    # 2. Recalculate and update student totals for performance (Aggregation Logic)
    # This must be done *after* the transaction is committed.
    recalculate_student_totals(db, point_award.student_id) # <-- CRITICAL CALL
    
    return db_transaction
