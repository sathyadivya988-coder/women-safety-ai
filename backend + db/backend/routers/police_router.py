from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.sos_alert import SOSAlert
from pydantic import BaseModel

router = APIRouter(prefix="/police", tags=["Police Dashboard"])

class DispatchRequest(BaseModel):
    alert_id: int

@router.get("/alerts")
def get_active_alerts(db: Session = Depends(get_db)):
    """
    Returns all currently active SOS alerts.
    """
    alerts = db.query(SOSAlert).filter(SOSAlert.status == "active").order_by(SOSAlert.created_at.desc()).all()
    # In a real app we'd serialize this better (Pydantic models)
    return [{
        "id": a.id,
        "user_id": a.user_id,
        "latitude": a.latitude,
        "longitude": a.longitude,
        "status": a.status,
        "created_at": a.created_at
    } for a in alerts]

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
