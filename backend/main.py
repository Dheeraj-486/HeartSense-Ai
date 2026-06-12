import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import database engine and Base to create tables
from backend.database.connection import engine, Base
from backend.models import database_models  # Ensures models are imported

# Create database tables
try:
    logging.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logging.info("Database tables successfully created/verified.")
except Exception as e:
    logging.error(f"Error creating database tables on startup: {e}")

# Import API routes
from backend.routes import auth, predictions, chatbot, reports, settings, dashboard

# Initialize FastAPI App
app = FastAPI(
    title="AI-Powered Heart Disease Detection Platform API",
    description="Backend API for cardiovascular scan analysis, AI predictions, and BioGPT medical chatbot.",
    version="1.0.0"
)

# CORS Middleware Configuration
# Allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for Uploads and Reports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

app.mount("/static/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/static/reports", StaticFiles(directory=REPORTS_DIR), name="reports")

# Include Router Modules
app.include_router(auth.router)
app.include_router(predictions.router)
app.include_router(chatbot.router)
app.include_router(reports.router)
app.include_router(settings.router)
app.include_router(dashboard.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": os.getenv("CURRENT_TIME", "2026-06-12T12:28:00+05:30"),
        "database": engine.name,
        "features": {
            "auth": True,
            "vit_analysis": True,
            "biogpt_chat": True,
            "pdf_generation": True
        }
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical AI Heart Disease Detection Platform API."}
