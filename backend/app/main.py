# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import database objects
from app.database import engine, Base
# Import all models to ensure Base knows about them for table creation
from app.models import department, student, event, point_transaction, user
from app.routers import departments, students, events, leaderboard, auth

# -------------------- DB Setup --------------------
# Function to create all tables defined in Base.metadata
def create_db_tables():
    # Base.metadata will gather all models imported above (via app.models)
    # and create the corresponding tables in the database.
    Base.metadata.create_all(bind=engine)

# Run the function to ensure tables exist on startup
create_db_tables()
# -------------------- End DB Setup --------------------


app = FastAPI(
    title="Student of the Year",
    description="A web platform to track and reward student achievements.",
    version="0.1.0",
)

# -------------------- CORS Middleware --------------------\
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],            # Allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],            # Allow all headers
)

# -------------------- API Routers --------------------\
# Prefix all routers with /api
app.include_router(departments.router, prefix="/api")
app.include_router(students.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

# -------------------- Root Endpoint --------------------\
@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Student of the Year API"}