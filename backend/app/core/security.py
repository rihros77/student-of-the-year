# app/core/security.py

from datetime import datetime, timedelta, timezone
from jose import jwt

# ⚠️ IMPORTANT: Replace this with a strong, complex secret key from environment variables
SECRET_KEY = "your-very-strong-and-long-secret-key-that-should-be-in-env"
ALGORITHM = "HS256" # Standard algorithm for JWT

# Optional: Configuration for token expiry
ACCESS_TOKEN_EXPIRE_MINUTES = 30