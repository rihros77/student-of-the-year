# app/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db 
from app.models.user import User
from app.core.security import ALGORITHM, SECRET_KEY # ✅ This path now exists!
from jose import jwt, JWTError

# 1. Define the OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token") # Adjust to your login endpoint

# 2. Dependency to get the current user object
async def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # We assume your token payload includes 'username'
        username: str = payload.get("username")
        
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # Query the database for the user
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise credentials_exception
        
    return user

# 3. Dependency to specifically get the current ADMIN user
async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Ensures the authenticated user has the 'admin' role.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user