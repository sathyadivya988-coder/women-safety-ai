from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from geoalchemy2 import Geography
from datetime import datetime
from database import Base

class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geography(geometry_type='POINT', srid=4326))
    status = Column(String, default="active") # active, dispatched, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
