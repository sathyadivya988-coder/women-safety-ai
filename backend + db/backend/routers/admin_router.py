from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.sos_alert import SOSAlert
from models.crime_data import CrimeData
from models.user import User
from models.prediction import RiskPrediction
from services.heatmap_service import get_heatmap_data
from utils.csv_loader import process_crime_csv

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.post("/upload-crime-data")
def upload_crime_data(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a CSV dataset of historical crime data.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    try:
        # Pass the uploaded file stream to the utility function
        count_inserted = process_crime_csv(file.file, db)
        return {"message": f"Successfully loaded {count_inserted} crime records."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

@router.get("/heatmap")
def heatmap_view(db: Session = Depends(get_db)):
    """
    Return heatmap coordinates.
    """
    data = get_heatmap_data(db)
    return data

@router.get("/stats")
def system_statistics(db: Session = Depends(get_db)):
    """
    Return global system statistics.
    """
    total_users = db.query(func.count(User.id)).scalar()
    total_alerts = db.query(func.count(SOSAlert.id)).scalar()
    active_alerts = db.query(func.count(SOSAlert.id)).filter(SOSAlert.status == "active").scalar()
    total_crimes = db.query(func.count(CrimeData.id)).scalar()
    total_predictions = db.query(func.count(RiskPrediction.id)).scalar()

    return {
        "users_count": total_users,
        "sos_alerts": {
            "total": total_alerts,
            "active": active_alerts
        },
        "crime_records": total_crimes,
        "predictions_made": total_predictions
    }
