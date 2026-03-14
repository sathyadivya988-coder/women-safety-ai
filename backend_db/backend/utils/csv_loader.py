import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime
from models.crime_data import CrimeData

# City name to approximate lat/lng mapping for Indian cities
CITY_COORDS = {
    'Delhi': (28.6139, 77.2090),
    'Mumbai': (19.0760, 72.8777),
    'Bangalore': (12.9716, 77.5946),
    'Hyderabad': (17.3850, 78.4867),
    'Chennai': (13.0827, 80.2707),
    'Kolkata': (22.5726, 88.3639),
    'Pune': (18.5204, 73.8567),
    'Ahmedabad': (23.0225, 72.5714),
    'Jaipur': (26.9124, 75.7873),
    'Surat': (21.1702, 72.8311),
    'Lucknow': (26.8467, 80.9462),
    'Kanpur': (26.4499, 80.3319),
    'Nagpur': (21.1458, 79.0882),
    'Indore': (22.7196, 75.8577),
    'Bhopal': (23.2599, 77.4126),
    'Visakhapatnam': (17.6868, 83.2185),
    'Patna': (25.5941, 85.1376),
    'Ludhiana': (30.9010, 75.8573),
    'Agra': (27.1767, 78.0081),
    'Varanasi': (25.3176, 82.9739),
    'Meerut': (28.9845, 77.7064),
    'Rajkot': (22.3039, 70.8022),
    'Nashik': (19.9975, 73.7898),
    'Thane': (19.2183, 72.9781),
    'Faridabad': (28.4089, 77.3178),
    'Ghaziabad': (28.6692, 77.4538),
    'Vasai': (19.3919, 72.8397),
    'Kalyan': (19.2403, 73.1305),
    'Srinagar': (34.0837, 74.7973),
    'Allahabad': (25.4358, 81.8463),
}

def get_city_coords(city_name):
    """Return (lat, lng) for a city name, with small random offset for variety."""
    import random
    base = CITY_COORDS.get(city_name, (20.5937, 78.9629))  # Default: India center
    return (
        base[0] + random.uniform(-0.15, 0.15),
        base[1] + random.uniform(-0.15, 0.15)
    )

def process_crime_csv(file_stream, db: Session):
    """
    Handles BOTH the actual ML CSV format (City, Crime Description, Date of Occurrence, etc.)
    and the legacy expected format (crime_type, latitude, longitude, date, time, area).
    """
    try:
        df = pd.read_csv(file_stream)
        records = []

        # Detect format based on columns
        if 'Crime Description' in df.columns:
            # NEW FORMAT: actual crime_data.csv from ML folder
            for _, row in df.iterrows():
                try:
                    date_str = str(row.get('Date of Occurrence', '')).strip()
                    date_obj = None
                    time_obj = None
                    try:
                        dt = datetime.strptime(date_str, "%d-%m-%Y %H:%M")
                        date_obj = dt.date()
                        time_obj = dt.time()
                    except Exception:
                        pass

                    city = str(row.get('City', 'Unknown')).strip()
                    lat, lng = get_city_coords(city)

                    records.append(CrimeData(
                        crime_type=str(row.get('Crime Description', 'UNKNOWN')),
                        latitude=lat,
                        longitude=lng,
                        date=date_obj,
                        time=time_obj,
                        area=city
                    ))
                except Exception:
                    continue
        else:
            # LEGACY FORMAT: expected columns
            for _, row in df.iterrows():
                try:
                    date_obj = datetime.strptime(str(row['date']), "%Y-%m-%d").date() if pd.notnull(row.get('date')) else None
                    time_obj = datetime.strptime(str(row['time']), "%H:%M:%S").time() if pd.notnull(row.get('time')) else None
                    lat = float(row['latitude'])
                    lng = float(row['longitude'])
                    records.append(CrimeData(
                        crime_type=str(row['crime_type']),
                        latitude=lat,
                        longitude=lng,
                        date=date_obj,
                        time=time_obj,
                        area=str(row.get('area', 'Unknown'))
                    ))
                except Exception:
                    continue

        if records:
            db.add_all(records)
            db.commit()
        return len(records)

    except Exception as e:
        db.rollback()
        raise e


def seed_crime_data_from_file(db: Session, csv_path: str, limit: int = 5000):
    """
    Auto-seed the crime_data table from the local ML CSV file on startup.
    Only runs if the table is empty. Limits to `limit` rows for performance.
    """
    from models.crime_data import CrimeData
    from sqlalchemy import func
    existing = db.query(func.count(CrimeData.id)).scalar()
    if existing and existing > 0:
        print(f"[Seed] Crime data already seeded ({existing} records). Skipping.")
        return

    try:
        print(f"[Seed] Seeding crime data from {csv_path} ...")
        df = pd.read_csv(csv_path, nrows=limit)
        records = []

        col_map = {}
        if 'Crime Description' in df.columns:
            col_map = {
                'type_col': 'Crime Description',
                'city_col': 'City',
                'date_col': 'Date of Occurrence',
                'fmt': "%d-%m-%Y %H:%M"
            }
        else:
            print("[Seed] Unknown CSV format, skipping seed.")
            return

        for _, row in df.iterrows():
            try:
                date_str = str(row.get(col_map['date_col'], '')).strip()
                date_obj, time_obj = None, None
                try:
                    dt = datetime.strptime(date_str, col_map['fmt'])
                    date_obj, time_obj = dt.date(), dt.time()
                except Exception:
                    pass

                city = str(row.get(col_map['city_col'], 'Unknown')).strip()
                lat, lng = get_city_coords(city)

                records.append(CrimeData(
                    crime_type=str(row.get(col_map['type_col'], 'UNKNOWN')),
                    latitude=lat,
                    longitude=lng,
                    date=date_obj,
                    time=time_obj,
                    area=city
                ))
            except Exception:
                continue

        if records:
            db.add_all(records)
            db.commit()
            print(f"[Seed] Successfully seeded {len(records)} crime records.")
        else:
            print("[Seed] No records were processed.")

    except Exception as e:
        db.rollback()
        print(f"[Seed] Crime data seed failed: {e}")
