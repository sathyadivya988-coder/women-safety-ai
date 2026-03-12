from sqlalchemy import Column, Integer, Float, String, Date, Time
from geoalchemy2 import Geography
from database import Base

class CrimeData(Base):
    __tablename__ = "crime_data"

    id = Column(Integer, primary_key=True, index=True)
    crime_type = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geography(geometry_type='POINT', srid=4326))
    date = Column(Date)
    time = Column(Time)
    area = Column(String)
