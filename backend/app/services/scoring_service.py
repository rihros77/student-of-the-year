from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student_total import StudentTotal
from app.models.point_transaction import PointTransaction
from typing import Dict

# Define the categories for aggregation (must match the PointTransaction.category values)
POINT_CATEGORIES = [
    'academics',
    'sports',
    'cultural',
    'technical',
    'social'
]

def recalculate_student_totals(db: Session, student_id: int):
    """
    Recalculate all point totals for a student based on current point transactions.
    This ensures totals are always up-to-date, even if transactions are added, updated, or deleted.
    """
    # Aggregate total points per category for this student
    query_results = db.query(
        PointTransaction.category,
        func.sum(PointTransaction.points).label("total_points")
    ).filter(
        PointTransaction.student_id == student_id
    ).group_by(
        PointTransaction.category
    ).all()

    # Initialize totals dictionary
    totals: Dict[str, int] = {cat: 0 for cat in POINT_CATEGORIES}
    composite_sum = 0

    # Fill totals from query
    for category, total_points in query_results:
        if category in totals:
            totals[category] = total_points
            composite_sum += total_points

    # Get or create the StudentTotal record
    student_total = db.query(StudentTotal).filter(
        StudentTotal.student_id == student_id
    ).first()

    if not student_total:
        student_total = StudentTotal(student_id=student_id)
        db.add(student_total)

    # Update totals
    student_total.academics_points = totals['academics']
    student_total.sports_points = totals['sports']
    student_total.cultural_points = totals['cultural']
    student_total.technical_points = totals['technical']
    student_total.social_points = totals['social']
    student_total.composite_points = composite_sum

    # Commit changes
    db.commit()
    db.refresh(student_total)
