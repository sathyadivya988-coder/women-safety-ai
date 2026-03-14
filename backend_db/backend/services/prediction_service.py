import requests

def get_prediction(data):

    url = "http://127.0.0.1:5000/predict"

    response = requests.post(url, json=data)

    return response.json()