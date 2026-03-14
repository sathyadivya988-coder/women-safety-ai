import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Standard SQLite connection URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./womensafety.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations():
    """
    Safely add new columns to existing tables without dropping data.
    This handles the case where the DB was created before new columns were added.
    """
    with engine.connect() as conn:
        # Add emergency_contact to users if not exists
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN emergency_contact VARCHAR"))
            conn.commit()
            print("Migration: Added 'emergency_contact' to users table.")
        except Exception:
            pass  # Column already exists, ignore

        # Add risk_score to sos_alerts if not exists
        try:
            conn.execute(text("ALTER TABLE sos_alerts ADD COLUMN risk_score FLOAT"))
            conn.commit()
            print("Migration: Added 'risk_score' to sos_alerts table.")
        except Exception:
            pass  # Column already exists, ignore

# Dependency handler to fetch database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
