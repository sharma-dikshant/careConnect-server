from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import Doctor, Patient
from ..schemas import DoctorCreate, LoginCreate
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt


SECRET_KEY = "my_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hash_password: str):
    return pwd_context.verify(plain_password, hash_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()   # clone the payload (e.g., {"sub": "user_id"})
    # set token expiry (default: ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    # add "exp" claim required by JWT for expiration
    to_encode.update({"exp": expire})
    # encode JWT with secret key + algorithm
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


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

    token = create_access_token(
        {"id": existing.id, "role": "doctor", "name": existing.name, "email": existing.email})
    return {"message": "success", "data": {"token": token}}


def login_patient(email: str, password: str, db: Session):
    existing = db.query(Patient).filter(Patient.email == email).first()
    if existing is None:
        raise HTTPException(403, detail="No patient exist with given email id")

    if verify_password(password, existing.password) == False:
        raise HTTPException(400, detail="incorrect password")

    token = create_access_token(
        {"id": existing.id, "role": "patient", "name": existing.name, "email": existing.email})
    return {"message": "success", "data": {"token": token}}


def signup(doctor: DoctorCreate, db: Session):
    # check if already exist
    existing = db.query(Doctor).filter(Doctor.email == doctor.email).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="user with this email already exists")

    doctor.password = hash_password(doctor.password)
    new_doctor = Doctor(**doctor.model_dump())
    token = create_access_token(
        {"id": new_doctor.id, "role": "doctor", "name": new_doctor.name, "email": new_doctor.email})
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return {"message": "Signup successful", "data": {"token": token}}


def logout():
    return {"message": "success", "data": {"token": "invalid"}}
