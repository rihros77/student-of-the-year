from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict

# Shared Pydantic configuration for SQLAlchemy ORM compatibility
Config = ConfigDict(from_attributes=True)

# -------------------- Department Schemas --------------------
class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    model_config = Config

# -------------------- Student Schemas --------------------
class StudentCreate(BaseModel):
    student_id: str
    name: str
    year: int
    department_id: int

class StudentResponse(BaseModel):
    id: int
    student_id: str
    name: str
    year: int
    department: Optional[DepartmentResponse]  # Nested department object
    points: int = 0  # Total points for leaderboard
    model_config = Config

# -------------------- Event Schemas --------------------
class EventBase(BaseModel):
    title: str
    category: Optional[str] = None  # e.g., 'academic', 'sports', 'cultural'
    date: Optional[datetime] = None
    participation_points: Optional[int] = 0
    winner_points: Optional[int] = 0

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    model_config = Config

# -------------------- Point Transaction Schemas --------------------
class PointTransactionBase(BaseModel):
    student_id: int
    event_id: int
    points: int
    category: str
    reason: Optional[str] = None

class PointTransactionCreate(PointTransactionBase):
    pass

class PointTransactionResponse(PointTransactionBase):
    id: int
    created_at: datetime
    model_config = Config

# -------------------- Additional Payloads --------------------
class PointAward(BaseModel):
    student_id: int
    event_id: int
    points: int
    category: str
    reason: Optional[str] = None
    model_config = Config

# -------------------- User Schemas --------------------
class UserCreate(BaseModel):
    username: str
    password: str
    role: Literal["admin", "student"]  # Only "admin" or "student" allowed

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    model_config = Config
