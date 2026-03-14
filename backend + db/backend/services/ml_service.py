import os
import joblib
import pandas as pd
from datetime import datetime
from services.heatmap_service import calculate_crime_density
from sqlalchemy.orm import Session

# In a real scenario, this path points to a trained model pickle file e.g., 'model.pkl'
MODEL_PATH = os.getenv("MODEL_PATH", "mock_model.pkl")

# We mock the model here in case the pickle file is not present
class MockModel:
    def predict(self, feature_df):
        # A simple mock logic to return a risk score based on features
        scores = []
        for index, row in feature_df.iterrows():
            density = row.get('crime_density', 0)
            if density > 10:
                scores.append(85.0) # High risk
            elif density > 3:
                scores.append(50.0) # Medium risk
            else:
                scores.append(15.0) # Low risk
        return scores

    def predict_categories(self, feature_df):
        scores = self.predict(feature_df)
        labels = []
        for score in scores:
            if score >= 75:
                labels.append("high")
            elif score >= 40:
                labels.append("medium")
            else:
                labels.append("low")
        return [scores, labels]


# Load model at startup
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        print(f"Model file {MODEL_PATH} not found. Using MockModel.")
        model = MockModel()
except Exception as e:
    print(f"Error loading model: {e}")
    model = MockModel()


def predict_risk(db: Session, lat: float, lon: float) -> dict:
    """
    Calls the AI model to predict risk score based on location and time.
    """
    # 1. Gather features for the model
    current_time = datetime.now()
    hour = current_time.hour
    
    # 2. Get local crime density
    density = calculate_crime_density(db, lat=lat, lon=lon, radius_km=1.5)
    
    # 3. Create feature dataframe
    features = pd.DataFrame([{
        'latitude': lat,
        'longitude': lon,
        'hour': hour,
        'crime_density': density
    }])
    
    # 4. Run prediction
    # MockModel returns [scores_list, labels_list]
    prediction = model.predict_categories(features)
    
    score = prediction[0][0]
    level = prediction[1][0]
    
    return {
        "risk_score": score,
        "risk_level": level,
        "crime_density": density
    }
