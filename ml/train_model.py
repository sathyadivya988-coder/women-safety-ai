import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
data = pd.read_csv("crime_data.csv")

# Select useful columns
data = data[["City","Crime Domain","Weapon Used","Victim Gender"]]

# Create Risk column
def get_risk(domain):
    if domain == "Violent Crime":
        return "High"
    elif domain == "Other Crime":
        return "Medium"
    else:
        return "Low"

data["Risk"] = data["Crime Domain"].apply(get_risk)

# Encode text columns
le_city = LabelEncoder()
le_weapon = LabelEncoder()
le_gender = LabelEncoder()

data["City"] = le_city.fit_transform(data["City"])
data["Weapon Used"] = le_weapon.fit_transform(data["Weapon Used"])
data["Victim Gender"] = le_gender.fit_transform(data["Victim Gender"])

# Features and target
X = data[["City","Weapon Used","Victim Gender"]]
y = data["Risk"]

# Split dataset
X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2)

# Train model
model = RandomForestClassifier()
model.fit(X_train,y_train)

# Save model
joblib.dump(model,"model.pkl")

print("✅ Model trained successfully")