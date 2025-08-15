from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.models import Doctor
from schemas.schemas import DoctorCreate

def login():
    return {"message": "success", "data":"login"}


def signup(doctor: DoctorCreate, db: Session):
    # check if already exist
    existing = db.query(Doctor).filter(Doctor.email == doctor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="user with this email already exists")
    
    new_doctor = Doctor(**doctor.model_dump())
    
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return {"message": "Signup successful", "data": {"id": new_doctor.id, "name": new_doctor.name}}


def logout():
    return {"message": "success", "data":"logout"}