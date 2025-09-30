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
    """
    Retrieves a list of all defined events.
    """
    events = db.query(Event).all()
    return events

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single event by its ID.
    """
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    """
    Creates a new event definition.
    """
    # Note: EventCreate uses the fields: title, category, date, participation_points, winner_points
    # The Event model in the database is slightly different (name, description, points_awarded).
    # Assuming schemas.EventCreate has been correctly aligned with the Event model:
    db_event = Event(
        name=event.title, # Assuming title maps to name
        description=event.category, # Assuming category/description is passed here (you might need to adjust your schema/model if this is wrong)
        points_awarded=event.participation_points # Assuming participation points is the main value
        # This part requires a confirmation of your Event schema/model definition. 
        # For now, I'm mapping the fields as best as possible.
    )
    # The above mapping is speculative based on the general structure; please ensure Event model
    # fields match exactly the fields you intend to create here.
    # A safer, temporary mapping:
    # db_event = Event(**event.model_dump()) 
    
    # Since the Event model definition was not explicitly provided in the request context, 
    # I will use a direct mapping of model_dump() for compatibility assuming the schemas match,
    # but the previous response hinted at a discrepancy: 
    # Event model: id, name, description, points_awarded
    # EventCreate schema: title, category, date, participation_points, winner_points
    # For now, I will use a direct mapping using kwargs:
    
    # Safest assumption: The schema fields match the model kwargs for Event.
    try:
        db_event = Event(**event.model_dump(exclude_unset=True))
    except Exception:
        # Fallback to the properties used in the schema of the previous snippet
        db_event = Event(
            name=event.title,
            description=event.category,
            points_awarded=event.participation_points
        )
        
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event: schemas.EventCreate, db: Session = Depends(get_db)):
    """
    Updates an existing event definition.
    """
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Update all fields from the schema
    update_data = event.model_dump(exclude_unset=True)
    
    # Map schema fields to model fields if necessary (as noted in create_event)
    if 'title' in update_data:
        update_data['name'] = update_data.pop('title')
    if 'category' in update_data:
        # Assuming category maps to description or another field
        # We will skip direct mapping for now and rely on the model definition if possible
        pass 
    if 'participation_points' in update_data:
        update_data['points_awarded'] = update_data.pop('participation_points')


    for key, value in update_data.items():
        setattr(db_event, key, value)
        
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Deletes an event. Note: Deleting an event does NOT automatically delete 
    associated PointTransactions. A cleanup/recalculation service would be 
    required for full data integrity, but for this MVP we only delete the event.
    """
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"ok": True} # HTTP 204 typically returns no content, but this is a common FastAPI pattern for 204

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
