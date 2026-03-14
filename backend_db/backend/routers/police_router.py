from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sos_alert import SOSAlert
from pydantic import BaseModel

router = APIRouter(tags=["Police Dashboard"])

class DispatchRequest(BaseModel):
    alert_id: int

from models.user import User

@router.get("/alerts")
def get_active_alerts(db: Session = Depends(get_db)):
    """
    Returns all currently active SOS alerts with user info.
    """
    results = db.query(SOSAlert, User).join(User, SOSAlert.user_id == User.id).filter(SOSAlert.status == "active").order_by(SOSAlert.created_at.desc()).all()
    
    return [{
        "id": a.id,
        "user_id": a.user_id,
        "user_name": u.name,
        "user_phone": u.phone,
        "emergency_contact": u.emergency_contact,
        "latitude": a.latitude,
        "longitude": a.longitude,
        "risk_score": a.risk_score,
        "status": a.status,
        "created_at": a.created_at
    } for a, u in results]

@router.post("/dispatch")
def dispatch_police(request: DispatchRequest, db: Session = Depends(get_db)):
    """
    Update the status of an active SOS alert to 'dispatched'.
    """
    alert = db.query(SOSAlert).filter(SOSAlert.id == request.alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    if alert.status != "active":
        raise HTTPException(status_code=400, detail="Alert is already assigned or resolved")

    alert.status = "dispatched"
    db.commit()
    return {"message": f"Units dispatched for alert {alert.id}", "status": "dispatched"}
