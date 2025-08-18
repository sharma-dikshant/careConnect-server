from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import Doctor, Patient
from ..schemas import DoctorCreate, LoginCreate, ApiResponse
from passlib.context import CryptContext
from .. import oauth2


pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def login(data: LoginCreate, db: Session):
    if (data.type == "doctor"):
        return login_doctor(data.email, data.password, db)
    elif (data.type == 'patient'):
        return login_patient(data.email, data.password, db)


def login_doctor(email: str, password: str, db: Session):
    existing = db.query(Doctor).filter(Doctor.email == email).first()
    if existing is None:
        raise HTTPException(403, detail="No doctor exist with given email id")

    if verify_password(password, existing.password) == False:
        raise HTTPException(400, detail="incorrect password")

    token = oauth2.create_access_token(
        {"id": existing.id, "role": "doctor", "name": existing.name, "email": existing.email})
    return ApiResponse(message="logged in", data={"token": token, "type": "Bearer"})


def login_patient(email: str, password: str, db: Session):
    existing = db.query(Patient).filter(Patient.email == email).first()
    if existing is None:
        raise HTTPException(403, detail="No patient exist with given email id")

    if verify_password(password, existing.password) == False:
        raise HTTPException(400, detail="incorrect password")

    token = oauth2.create_access_token(
        {"id": existing.id, "role": "patient", "name": existing.name, "email": existing.email})
    return ApiResponse(message="logged in", data={"token": token, "type": "Bearer"})


def signup(doctor: DoctorCreate, db: Session):
    # check if already exist
    existing = db.query(Doctor).filter(Doctor.email == doctor.email).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="user with this email already exists")

    doctor.password = hash_password(doctor.password)
    new_doctor = Doctor(**doctor.model_dump())
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    token = oauth2.create_access_token(
        {"id": new_doctor.id, "role": "doctor", "name": new_doctor.name, "email": new_doctor.email})
    return ApiResponse(message="signed up", data={"token": token, "type": "Bearer"})


def logout():
    return ApiResponse(message="logged out", data={"token": "invalid", "type": "Bearer"})
