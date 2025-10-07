# app/models/__init__.py
from .department import Department
from .student import Student
from .event import Event
from .point_transaction import PointTransaction
from .user import User
from .student_total import StudentTotal
from .final_snapshot import FinalSnapshot  # ✅ newly added

__all__ = [
    "Department",
    "Student",
    "Event",
    "PointTransaction",
    "User",
    "StudentTotal",
    "FinalSnapshot",  # ✅ include in __all__
]
