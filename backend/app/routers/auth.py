# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.database import SessionLocal
from app.models import User
from app.schemas import UserCreate, UserLogin, UserResponse

# -------------------- JWT Settings --------------------
SECRET_KEY = "your-secret-key"  # CHANGE THIS to a strong random string in production
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

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hashes a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_db():
    """Dependency to get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- Registration --------------------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user with a hashed password.
    """
    # Check if a user with the same username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Create the new user
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

# -------------------- Login --------------------
@router.post("/login", response_model=dict)
def login_for_access_token(user: UserLogin, db: Session = Depends(get_db)):
    """
    Verifies user credentials and returns a JWT token with user info.
    """
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    # Create JWT token
    access_token = create_access_token(data={"sub": db_user.username})

    return {
        "token": access_token,  # This is what your frontend needs
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "role": db_user.role
        }
    }
