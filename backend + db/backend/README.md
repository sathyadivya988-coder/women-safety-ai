# AI-Powered Real-Time Women Safety Prediction and Assistance System

This is the FastAPI backend for the Women Safety System. It incorporates PostGIS for spatial data and Scikit-learn for AI-based risk predictions.

## Prerequisites
1. Python 3.9+
2. PostgreSQL with PostGIS extension enabled

## Setup Instructions

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `womensafety`. Enable the PostGIS extension on it:
```sql
CREATE DATABASE womensafety;
\c womensafety
CREATE EXTENSION postgis;
```

Update the `SQLALCHEMY_DATABASE_URL` in `database.py` with your credentials or set the `DATABASE_URL` environment variable. Examples: `postgresql+psycopg2://postgres:password@localhost:5432/womensafety`

### 2. Environment Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Running the Server
```bash
uvicorn main:app --reload
```
The server will run at `http://localhost:8000`. 
Interactive API Docs are available at `http://localhost:8000/docs`.

## Important Note on AI Model
The code expects a scikit-learn model file path set in the `MODEL_PATH` environment variable (defaults to `mock_model.pkl`). Since this is a placeholder implementation, a `MockModel` object inside `services/ml_service.py` handles risk prediction dynamically simulating basic logic. To use a real model, drop a `.pkl` file matching the feature inputs and reload the app.

## Example API Responses

### Trigger SOS Alert
**POST** `/sos-alert`
*Request:*
```json
{
  "user_id": 1,
  "latitude": 28.704060,
  "longitude": 77.102493
}
```
*Response:*
```json
{
  "alert_id": 1,
  "risk_level": "high",
  "risk_score": 85.0
}
```

### Get Heatmap
**GET** `/admin/heatmap`
*Response:*
```json
[
  {
    "latitude": 28.70406,
    "longitude": 77.102493,
    "weight": 1.0
  }
]
```

### Police Dispatch
**POST** `/police/dispatch`
*Request:*
```json
{
  "alert_id": 1
}
```
*Response:*
```json
{
  "message": "Units dispatched for alert 1",
  "status": "dispatched"
}
```
