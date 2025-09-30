# app/models/__init__.py (Updated)
from .department import Department
from .student import Student
from .event import Event
from .point_transaction import PointTransaction
from .user import User
from .student_total import StudentTotal 

__all__ = ["Department", "Student", "Event", "PointTransaction", "User", "StudentTotal"] 