from sqlalchemy.orm import Session
from app.models.student_total import StudentTotal
from app.models.point_transaction import PointTransaction
from typing import List, Dict

# Define the categories for aggregation (must match the point_transaction category column)
POINT_CATEGORIES = [
    'academics', 
    'sports', 
    'cultural', 
    'technical', 
    'social'
]

def recalculate_student_totals(db: Session, student_id: int):
    """
    Recalculates all point totals for a given student from their point_transactions
    and updates the StudentTotal table.
    
    This function should be called after every new point transaction.
    """
    
    # 1. Aggregate points using a single, efficient database query
    # We group all transactions by category and sum the points.
    
    # Define the columns to aggregate (category and sum of points)
    query_results = db.query(
        PointTransaction.category,
        func.sum(PointTransaction.points).label('total_points')
    ).filter(
        PointTransaction.student_id == student_id
    ).group_by(
        PointTransaction.category
    ).all()

    # Initialize totals dictionary
    totals: Dict[str, int] = {cat: 0 for cat in POINT_CATEGORIES}
    composite_sum = 0
    
    # 2. Map results back to the totals dictionary
    for category, total_points in query_results:
        if category in totals:
            totals[category] = total_points
            composite_sum += total_points # Simple sum for composite score

    # 3. Get or create the StudentTotal record
    student_total = db.query(StudentTotal).filter(
        StudentTotal.student_id == student_id
    ).first()

    if not student_total:
        student_total = StudentTotal(student_id=student_id)
        db.add(student_total)

    # 4. Update the record with new totals
    student_total.academics_points = totals['academics']
    student_total.sports_points = totals['sports']
    student_total.cultural_points = totals['cultural']
    student_total.technical_points = totals['technical']
    student_total.social_points = totals['social']
    student_total.composite_points = composite_sum 

    # 5. Commit changes to the totals table
    db.commit()
    db.refresh(student_total)
    
    # Note: We do not return the object since this is a side-effect service function.
