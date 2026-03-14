from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["Authentication"])

class UserSignup(BaseModel):
    name: str
    phone: str
    password: Optional[str] = "password123"
    role: str = "user"
    emergency_contact: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class EmergencyContactUpdate(BaseModel):
    emergency_contact: str

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(request: UserSignup, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.phone == request.phone).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    new_user = User(
        name=request.name,
        phone=request.phone,
        role=request.role,
        emergency_contact=request.emergency_contact
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "User created successfully", "user_id": new_user.id, "role": new_user.role}

@router.post("/login")
def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == request.phone).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "phone": user.phone,
            "emergency_contact": user.emergency_contact
        }
    }

@router.patch("/user/{user_id}/emergency-contact")
def update_emergency_contact(user_id: int, request: EmergencyContactUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.emergency_contact = request.emergency_contact
    db.commit()
    db.refresh(user)
    return {
        "message": "Emergency contact updated",
        "emergency_contact": user.emergency_contact
    }

@router.get("/user/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role,
        "emergency_contact": user.emergency_contact
    }
