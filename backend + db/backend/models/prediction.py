from sqlalchemy import Column, Integer, Float, DateTime
from datetime import datetime
from database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    risk_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
