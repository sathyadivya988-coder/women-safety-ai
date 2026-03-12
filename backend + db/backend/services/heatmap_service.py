from sqlalchemy.orm import Session
from sqlalchemy import func
from models.crime_data import CrimeData

def calculate_crime_density(db: Session, lat: float, lon: float, radius_km: float = 1.0) -> int:
    """
    Calculate crime density around a given location using PostGIS spatial functions.
    Returns the number of crimes within the specified radius (in kilometers).
    """
    # ST_DWithin checks if two geometries are within a given distance in meters
    # The Geography type uses meters for distance by default
    radius_meters = radius_km * 1000
    
    # Create the point geometry for the given lat/lon
    point_geom = f"SRID=4326;POINT({lon} {lat})"
    
    # Query counting crimes within the radius
    count = db.query(func.count(CrimeData.id)).filter(
        func.ST_DWithin(CrimeData.location, point_geom, radius_meters)
    ).scalar()
    
    return count or 0

def get_heatmap_data(db: Session):
    """
    Fetch all crime locations and optionally aggregate them or return them
    so the frontend can render a heatmap layer.
    """
    crimes = db.query(CrimeData.latitude, CrimeData.longitude).all()
    
    # Provide a simple mock risk score based on generic densities for heatmap
    # depending on frontend requirements. For now, returning raw points.
    heatmap = []
    for crime in crimes:
        heatmap.append({
            "latitude": crime.latitude,
            "longitude": crime.longitude,
            "weight": 1.0  # Default weight per crime for simple heatmap
        })
    
    return heatmap
