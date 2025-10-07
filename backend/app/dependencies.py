# app/dependencies.py
from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.schemas import UserResponse

# Dummy function for admin authentication
def get_current_admin_user() -> User:
    """
    This is a placeholder dependency for admin authentication.
    Replace this with your actual auth logic (e.g., JWT, OAuth2, etc.).
    """
    # Here, we simply raise an error if the user is not admin
    # For now, assume a hardcoded admin user for testing
    admin_user = User(id=1, username="admin", role="admin")  # Example user
    if admin_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return admin_user
