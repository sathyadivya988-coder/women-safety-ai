from fastapi import FastAPI
from services.prediction_service import get_prediction

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend Running"}

@app.post("/predict-risk")
def predict(data: dict):

    result = get_prediction(data)

    return result