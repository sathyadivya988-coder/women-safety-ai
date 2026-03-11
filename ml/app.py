from flask import Flask, request, jsonify
import joblib
import pandas as pd

# Initialize Flask
app = Flask(__name__)

# Load trained model
model = joblib.load("model.pkl")

@app.route("/")
def home():
    return "Women Safety AI Model Running"

@app.route("/predict", methods=["POST"])
def predict():
    
    data = request.get_json()

    state = data["STATE_UT"]
    district = data["DISTRICT"]
    year = data["YEAR"]
    murder = data["MURDER"]
    rape = data["RAPE"]
    kidnapping = data["KIDNAPPING"]

    # Create dataframe for prediction
    input_data = pd.DataFrame([[state, district, year, murder, rape, kidnapping]],
    columns=[
        "STATE/UT",
        "DISTRICT",
        "YEAR",
        "MURDER",
        "RAPE",
        "KIDNAPPING & ABDUCTION"
    ])

    prediction = model.predict(input_data)

    return jsonify({
        "Risk Level": prediction[0]
    })

if __name__ == "__main__":
    app.run(debug=True)