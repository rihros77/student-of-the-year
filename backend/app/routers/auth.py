# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

from app.database import get_db
from app.models import User, Student
from app.schemas import UserCreate, UserLogin, UserResponse
from app.core.security import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -----------------------------
# Create JWT Token
# -----------------------------
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# -----------------------------
# Hash Password
# -----------------------------
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# -----------------------------
# REGISTER
# -----------------------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(User.username == user.username).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed = get_password_hash(user.password)

    new_user = User(
        username=user.username,
        hashed_password=hashed,
        role=user.role
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

    return new_user


# -----------------------------
# LOGIN
# -----------------------------
@router.post("/login", response_model=dict)
def login_for_access_token(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password"
        )

    # Load student_id if student
    student_id = None
    if db_user.role == "student":
        student = db.query(Student).filter(Student.id == db_user.id).first()
        if not student:
            raise HTTPException(400, "Student record missing.")
        student_id = student.id

    # CREATE TOKEN using security.py constants
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role}
    )

    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role,
        "username": db_user.username,
    }

    if student_id:
        response["student_id"] = student_id

    return response
