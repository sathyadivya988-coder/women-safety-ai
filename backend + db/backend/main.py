from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.prediction_service import get_prediction
from database import engine, Base, run_migrations
import models
from routers.sos_router import router as sos_router
from routers.police_router import router as police_router
from routers.admin_router import router as admin_router
from routers.auth_router import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    run_migrations()
    # Auto-seed crime data from the ML CSV if DB is empty
    try:
        import os
        from database import SessionLocal
        from utils.csv_loader import seed_crime_data_from_file
        csv_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml', 'crime_data.csv')
        csv_path = os.path.abspath(csv_path)
        if os.path.exists(csv_path):
            db = SessionLocal()
            try:
                seed_crime_data_from_file(db, csv_path, limit=5000)
            finally:
                db.close()
        else:
            print(f"[Seed] CSV not found at {csv_path}, skipping crime data seed.")
    except Exception as e:
        print(f"[Seed] Crime data auto-seed error: {e}")

app.include_router(auth_router)
app.include_router(sos_router)
app.include_router(police_router)
app.include_router(admin_router)

@app.get("/")
def home():
    return {"message": "Backend Running"}

@app.post("/predict-risk")
def predict(data: dict):

    result = get_prediction(data)

    return result