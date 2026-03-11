from flask import Flask,request,jsonify
import joblib

app = Flask(__name__)

model = joblib.load("model.pkl")

@app.route("/")
def home():
    return "Women Safety AI API is running"

@app.route("/predict",methods=["GET"])
def predict():

    city = int(request.args.get("city"))
    weapon = int(request.args.get("weapon"))
    gender = int(request.args.get("gender"))

    prediction = model.predict([[city,weapon,gender]])

    return jsonify({
        "Risk Level": prediction[0]
    })

if __name__ == "__main__":
    app.run(debug=True)