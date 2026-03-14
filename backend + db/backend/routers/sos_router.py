from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.sos_alert import SOSAlert
from models.prediction import RiskPrediction
from services.ml_service import predict_risk
from pydantic import BaseModel

router = APIRouter(tags=["SOS Alerts"])

class SOSAlertRequest(BaseModel):
    user_id: int
    latitude: float
    longitude: float

@router.post("/sos-alert", status_code=status.HTTP_201_CREATED)
def trigger_sos_alert(request: SOSAlertRequest, db: Session = Depends(get_db)):
    """
    Trigger an SOS alert.
    Stores the alert, calculates risk level via ML model, and returns it.
    """
    # 1. Calculate risk
    try:
        risk_data = predict_risk(db, request.latitude, request.longitude)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction failed: {str(e)}")

    # 2. Store prediction
    new_prediction = RiskPrediction(
        latitude=request.latitude,
        longitude=request.longitude,
        risk_score=risk_data['risk_score']
    )
    db.add(new_prediction)
    
    # 3. Store SOS Alert
    new_alert = SOSAlert(
        user_id=request.user_id,
        latitude=request.latitude,
        longitude=request.longitude,
        risk_score=risk_data['risk_score']
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    
    return {
        "alert_id": new_alert.id,
        "risk_level": risk_data["risk_level"],
        "risk_score": risk_data["risk_score"]
    }
