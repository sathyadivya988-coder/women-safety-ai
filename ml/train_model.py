import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

# Load dataset
data = pd.read_csv("crime_india.csv")

# Remove extra spaces
data.columns = data.columns.str.strip()

# Fill missing values
data.fillna(0, inplace=True)

# Convert STATE/UT and DISTRICT to numbers
le_state = LabelEncoder()
le_district = LabelEncoder()

data["STATE/UT"] = le_state.fit_transform(data["STATE/UT"])
data["DISTRICT"] = le_district.fit_transform(data["DISTRICT"])

# Create total crime score
data["TOTAL_CRIME"] = (
    data["MURDER"] +
    data["RAPE"] +
    data["KIDNAPPING & ABDUCTION"] +
    data["ROBBERY"] +
    data["BURGLARY"] +
    data["THEFT"] +
    data["RIOTS"] +
    data["ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY"] +
    data["CRUELTY BY HUSBAND OR HIS RELATIVES"]
)

# Create risk levels
def risk_level(x):
    if x < 50:
        return 0
    elif x < 150:
        return 1
    else:
        return 2

data["RISK"] = data["TOTAL_CRIME"].apply(risk_level)

# Features
X = data[[
    "STATE/UT",
    "DISTRICT",
    "YEAR",
    "MURDER",
    "RAPE",
    "KIDNAPPING & ABDUCTION",
    "ROBBERY",
    "BURGLARY",
    "THEFT",
    "RIOTS",
    "ASSAULT ON WOMEN WITH INTENT TO OUTRAGE HER MODESTY",
    "CRUELTY BY HUSBAND OR HIS RELATIVES"
]]

# Target
y = data["RISK"]

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model
model = RandomForestClassifier(n_estimators=300, random_state=42)

model.fit(X_train, y_train)

# Predict
pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, pred)

print("Model Accuracy:", accuracy)

# Save model
pickle.dump(model, open("model.pkl", "wb"))

print("✅ Model trained successfully")
print("📦 Model saved as model.pkl")