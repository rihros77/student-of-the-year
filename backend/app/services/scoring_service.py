# app/services/scoring_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.student_total import StudentTotal
from app.models.point_transaction import PointTransaction
from typing import Dict

# Categories to aggregate points
POINT_CATEGORIES = ['academics', 'sports', 'cultural', 'technical', 'social']

def recalculate_student_totals(db: Session, student_id: int):
    """
    Recalculate all point totals for a student based on current point transactions.
    Totals are always up-to-date. Wins are computed dynamically in leaderboard queries.
    """
    # Aggregate points per category
    results = (
        db.query(
            PointTransaction.category,
            func.sum(PointTransaction.points).label("total_points")
        )
        .filter(PointTransaction.student_id == student_id)
        .group_by(PointTransaction.category)
        .all()
    )

    # Initialize totals dict
    totals: Dict[str, int] = {cat: 0 for cat in POINT_CATEGORIES}
    composite_sum = 0

    for category, total_points in results:
        if category in totals:
            totals[category] = total_points
            composite_sum += total_points

    # Get or create StudentTotal record
    student_total = db.query(StudentTotal).filter(StudentTotal.student_id == student_id).first()
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
