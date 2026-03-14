from fastapi import APIRouter
from services.risk_engine import predict_risk

router = APIRouter()

@router.get("/predict-risk")
def get_risk(crime_density:int, night:int, crowd:int, weather:int):

    score = predict_risk(crime_density, night, crowd, weather)

    return {"risk_score": score}