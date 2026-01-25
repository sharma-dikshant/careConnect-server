from fastapi import APIRouter, Depends, HTTPException, status
from app.services import patients as controller
from sqlalchemy.orm import Session
from app.schemas import PatientCreate, AccessTokenPayload
from app.api.deps import get_db
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import Optional


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergencyContact: Optional[str] = None
    medicalHistory: Optional[str] = None
    allergies: Optional[str] = None
    currentMedications: Optional[str] = None
    status: Optional[str] = None


router = APIRouter(prefix='/api/patients', tags=['Patients'])


@router.post('/')
async def add_patient(body: PatientCreate, db: Session = Depends(get_db), login_user: AccessTokenPayload = Depends(get_current_user)):
    if login_user.role != "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.add_patient(body, login_user, db)


@router.get("/all/{doctor_id}")
async def get_all_patients(doctor_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role != "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.get_all_patients(doctor_id, login_user, db)


@router.get("/{patient_id}")
async def get_patient(patient_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role != "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.get_patient(patient_id, login_user, db)


@router.put("/{patient_id}")
async def update_patient(patient_id: int, patient_data: PatientUpdate, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role != "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.update_patient(patient_id, patient_data.model_dump(exclude_unset=True), login_user, db)


@router.delete("/{patient_id}")
async def delete_patient(patient_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role != "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.delete_patient(patient_id, login_user, db)


@router.patch('/inactive/{patient_id}')
async def inactive_patient(patient_id: int, db: Session = Depends(get_db), login_user: AccessTokenPayload = Depends(get_current_user)):
    if login_user.role != "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.inactive_patient(patient_id, login_user, db)
