# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.database import get_db
from app.models import User, Student
from app.schemas import UserCreate, UserLogin, UserResponse

# -------------------- JWT Settings --------------------
SECRET_KEY = "your-secret-key"  # ⚠️ Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    """Create a JWT token with expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# -------------------- FastAPI Router --------------------
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# -------------------- Password hashing --------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a plain password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

# -------------------- Registration --------------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with hashed password and validated role."""

    # Check existing user
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Hash password
    hashed_password = get_password_hash(user.password)

    # Create user object
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )

    # Save user
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failed: {e}"
        )

    return db_user

# -------------------- Login --------------------
@router.post("/login", response_model=dict)
def login_for_access_token(user: UserLogin, db: Session = Depends(get_db)):
    """Verify credentials and return JWT token with optional student_id."""

    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    # Get student_id only if user role is 'student'
    student_id = None
    if db_user.role == "student":
        student = db.query(Student).filter(Student.id == db_user.id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student record not found for this user"
            )
        student_id = student.id

    # Create token including role
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role}
    )

    # Return payload
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role,
    }
    if student_id:
        response["student_id"] = student_id

    return response
