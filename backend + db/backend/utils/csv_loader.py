import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime
from models.crime_data import CrimeData

def process_crime_csv(file_stream, db: Session):
    """
    Processes a CSV file containing crime data and loads it into the database.
    Expected CSV columns: crime_type, latitude, longitude, date (YYYY-MM-DD), time (HH:MM:SS), area
    """
    try:
        # Read streaming CSV via Pandas
        df = pd.read_csv(file_stream)
        
        # Simple Validation mapping
        records = []
        for index, row in df.iterrows():
            # Parse Date and Time safely
            try:
                date_obj = datetime.strptime(str(row['date']), "%Y-%m-%d").date() if pd.notnull(row['date']) else None
                time_obj = datetime.strptime(str(row['time']), "%H:%M:%S").time() if pd.notnull(row['time']) else None
            except ValueError:
                date_obj = None
                time_obj = None

            lat = float(row['latitude'])
            lon = float(row['longitude'])
            
            # PostGIS Point string
            pt_geom = f"SRID=4326;POINT({lon} {lat})"

            crime = CrimeData(
                crime_type=str(row['crime_type']),
                latitude=lat,
                longitude=lon,
                location=pt_geom,
                date=date_obj,
                time=time_obj,
                area=str(row.get('area', 'Unknown'))
            )
            records.append(crime)
            
        # Bulk save
        db.add_all(records)
        db.commit()
        return len(records)
        
    except Exception as e:
        db.rollback()
        raise e
