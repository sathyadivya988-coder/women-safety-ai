import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
data = pd.read_csv("crime_india.csv")

# Select useful columns
data = data[["STATE/UT","DISTRICT","YEAR","MURDER","RAPE","KIDNAPPING & ABDUCTION"]]

# Create Risk column based on crime severity
def get_risk(row):
    total = row["MURDER"] + row["RAPE"] + row["KIDNAPPING & ABDUCTION"]

    if total > 100:
        return "High"
    elif total > 30:
        return "Medium"
    else:
        return "Low"

data["Risk"] = data.apply(get_risk, axis=1)

# Encode categorical columns
le_state = LabelEncoder()
le_district = LabelEncoder()

data["STATE/UT"] = le_state.fit_transform(data["STATE/UT"])
data["DISTRICT"] = le_district.fit_transform(data["DISTRICT"])

# Features and target
X = data[["STATE/UT","DISTRICT","YEAR","MURDER","RAPE","KIDNAPPING & ABDUCTION"]]
y = data["Risk"]

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)
print("Model Accuracy:", accuracy)

# Save model
joblib.dump(model, "model.pkl")

print("✅ Model trained successfully")
print("📦 Model saved as model.pkl")