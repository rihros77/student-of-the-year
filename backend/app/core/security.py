# app/core/security.py

from datetime import datetime, timedelta, timezone
from jose import jwt

SECRET_KEY = "your-very-strong-and-long-secret-key-that-should-be-in-env"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
