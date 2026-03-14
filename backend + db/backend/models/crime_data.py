from sqlalchemy import Column, Integer, Float, String, Date, Time
from database import Base

class CrimeData(Base):
    __tablename__ = "crime_data"

    id = Column(Integer, primary_key=True, index=True)
    crime_type = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    date = Column(Date)
    time = Column(Time)
    area = Column(String)
