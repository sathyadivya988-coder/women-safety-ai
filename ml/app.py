from flask import Flask, request, jsonify
import pickle
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load trained model and encoders
model = pickle.load(open("model.pkl", "rb"))
le_state = pickle.load(open("le_state.pkl", "rb"))
le_district = pickle.load(open("le_district.pkl", "rb"))

def safe_encode(le, value):
    """Encodes a value using LabelEncoder; returns 0 if unknown."""
    try:
        # Check if value exists in encoder classes
        if value in le.classes_:
            return int(le.transform([value])[0])
        return 0 # Default for unknown
    except:
        return 0

@app.route("/")
def home():
    return "Women Safety AI API Running"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Transform raw strings to model-compatible numeric values
        state_encoded = safe_encode(le_state, data.get("STATE_UT", ""))
        dist_encoded = safe_encode(le_district, data.get("DISTRICT", ""))

        features = [[
            state_encoded,
            dist_encoded,
            data.get("YEAR", 2024),
            data.get("MURDER", 0),
            data.get("RAPE", 0),
            data.get("KIDNAPPING", 0),
            data.get("ROBBERY", 0),
            data.get("BURGLARY", 0),
            data.get("THEFT", 0),
            data.get("RIOTS", 0),
            data.get("ASSAULT", 0),
            data.get("CRUELTY", 0)
        ]]

        prediction = int(model.predict(features)[0])

        if prediction == 0:
            risk = "Low"
            advice = "Area appears relatively safe but remain cautious."
        elif prediction == 1:
            risk = "Medium"
            advice = "Stay alert and prefer well-lit public areas."
        else:
            risk = "High"
            advice = "Avoid isolated areas and travel with companions."

        total_crime = (
            data.get("MURDER", 0) +
            data.get("RAPE", 0) +
            data.get("KIDNAPPING", 0) +
            data.get("ROBBERY", 0) +
            data.get("BURGLARY", 0) +
            data.get("THEFT", 0) +
            data.get("RIOTS", 0) +
            data.get("ASSAULT", 0) +
            data.get("CRUELTY", 0)
        )

        safety_score = max(0, 100 - total_crime)

        return jsonify({
            "Risk Level": risk,
            "Safety Score": safety_score,
            "Advice": advice,
            "prediction_code": prediction
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)