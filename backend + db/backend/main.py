from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Database and Models
from database import engine, Base
import models

# Routers
from routers.sos_router import router as sos_router
from routers.police_router import router as police_router
from routers.admin_router import router as admin_router

# Initialize FastAPI App
app = FastAPI(
    title="Women Safety Prediction & Assistance API",
    description="Backend services for SOS alerts, real-time tracking, and AI risk prediction.",
    version="1.0.0"
)

# Configure CORS for React Native / Web Dashboards
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Database Tables
# Note: For PostGIS to work properly, the database must already have the `postgis` extension enabled.
Base.metadata.create_all(bind=engine)

# Include Routers
app.include_router(sos_router)
app.include_router(police_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Women Safety Prediction API"}
