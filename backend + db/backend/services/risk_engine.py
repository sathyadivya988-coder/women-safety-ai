import pickle
import pandas as pd

model = pickle.load(open("../../ml/model.pkl", "rb"))

def predict_risk(crime_density, night, crowd, weather):

    data = pd.DataFrame(
        [[crime_density, night, crowd, weather]],
        columns=["crime_density","night","crowd","weather"]
    )

    result = model.predict(data)

    return int(result[0])