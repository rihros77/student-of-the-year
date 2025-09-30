from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.models.point_transaction import PointTransaction
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
    return db_transaction
