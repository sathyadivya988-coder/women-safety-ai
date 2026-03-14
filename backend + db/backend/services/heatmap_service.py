from sqlalchemy.orm import Session
from sqlalchemy import func
from models.crime_data import CrimeData

def calculate_crime_density(db: Session, lat: float, lon: float, radius_km: float = 1.0) -> int:
    """
    Calculate crime density around a given location using standard lat/lon comparison.
    (Approximated bounding box for SQLite compatibility)
    """
    # approx 1km in degrees
    delta = radius_km / 111.0 
    
    count = db.query(func.count(CrimeData.id)).filter(
        CrimeData.latitude.between(lat - delta, lat + delta),
        CrimeData.longitude.between(lon - delta, lon + delta)
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
