from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model = joblib.load("model.pkl")

def get_safety_score(murder, rape, kidnapping):
    total = murder + rape + kidnapping
    score = max(0, 100 - total)
    return score

def get_advice(risk):
    if risk == "High":
        return "Avoid traveling alone at night and use safe transport."
    elif risk == "Medium":
        return "Stay alert and prefer well-lit public areas."
    else:
        return "Area appears relatively safe but remain cautious."

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

    input_data = pd.DataFrame([[state, district, year, murder, rape, kidnapping]],
    columns=[
        "STATE/UT",
        "DISTRICT",
        "YEAR",
        "MURDER",
        "RAPE",
        "KIDNAPPING & ABDUCTION"
    ])

    prediction = model.predict(input_data)[0]

    safety_score = get_safety_score(murder, rape, kidnapping)

    advice = get_advice(prediction)

    return jsonify({
        "Risk Level": prediction,
        "Safety Score": safety_score,
        "Advice": advice
    })

if __name__ == "__main__":
    app.run(debug=True)