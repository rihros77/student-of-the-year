# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import departments, students, events, leaderboard, auth

app = FastAPI(
    title="Student of the Year",
    description="A web platform to track and reward student achievements.",
    version="0.1.0",
)

# -------------------- CORS Middleware --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],            # Allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],            # Allow all headers
)

# -------------------- API Routers --------------------
# Prefix all routers with /api
app.include_router(departments.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(auth.router, prefix="/api")  # Now /api/auth/login works

# -------------------- Root Endpoint --------------------
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Student of the Year API"}
