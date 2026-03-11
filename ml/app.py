from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load trained model
model = pickle.load(open("model.pkl", "rb"))

@app.route("/")
def home():
    return "Women Safety AI API Running"

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    features = [[
        data["STATE_UT"],
        data["DISTRICT"],
        data["YEAR"],
        data["MURDER"],
        data["RAPE"],
        data["KIDNAPPING"],
        data["ROBBERY"],
        data["BURGLARY"],
        data["THEFT"],
        data["RIOTS"],
        data["ASSAULT"],
        data["CRUELTY"]
    ]]

    prediction = model.predict(features)[0]

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
        data["MURDER"] +
        data["RAPE"] +
        data["KIDNAPPING"] +
        data["ROBBERY"] +
        data["BURGLARY"] +
        data["THEFT"] +
        data["RIOTS"] +
        data["ASSAULT"] +
        data["CRUELTY"]
    )

    safety_score = max(0, 100 - total_crime)

    return jsonify({
        "Risk Level": risk,
        "Safety Score": safety_score,
        "Advice": advice
    })

if __name__ == "__main__":
    app.run(debug=True)