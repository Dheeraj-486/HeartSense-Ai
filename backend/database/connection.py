import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

# Database URL configuration
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    # If not configured, use local SQLite database
    db_dir = os.path.dirname(os.path.abspath(__file__))
    os.makedirs(db_dir, exist_ok=True)
    sqlite_db_path = os.path.join(db_dir, "medical_ai.db")
    DATABASE_URL = f"sqlite:///{sqlite_db_path}"
    logger.info(f"DATABASE_URL not set. Defaulting to SQLite database at {sqlite_db_path}")

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = None
SessionLocal = None

try:
    if not is_sqlite:
        logger.info("Attempting to connect to PostgreSQL...")
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Verify connection
        with engine.connect() as conn:
            pass
        logger.info("Successfully connected to PostgreSQL database.")
    else:
        engine = create_engine(DATABASE_URL, connect_args=connect_args)
        logger.info("Using SQLite database engine.")
except Exception as e:
    logger.error(f"Failed to connect to configured DATABASE_URL: {e}")
    if not is_sqlite:
        db_dir = os.path.dirname(os.path.abspath(__file__))
        os.makedirs(db_dir, exist_ok=True)
        sqlite_db_path = os.path.join(db_dir, "medical_ai.db")
        fallback_url = f"sqlite:///{sqlite_db_path}"
        logger.warning(f"Falling back to local SQLite database at {sqlite_db_path}")
        engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
