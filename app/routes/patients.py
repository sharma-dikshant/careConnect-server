from fastapi import APIRouter, Depends, HTTPException, status
from ..controllers import patients as controller
from sqlalchemy.orm import Session
from ..schemas import PatientCreate, AccessTokenPayload
from ..deps import get_db
from ..oauth2 import get_current_user


router = APIRouter(prefix='/api/patients', tags=['Patients'])


@router.post('/')
async def add_patient(body: PatientCreate, db: Session = Depends(get_db), login_user: AccessTokenPayload = Depends(get_current_user)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.add_patient(body, login_user, db)


@router.post('/inactive/{patient_id}')
async def inactive(patient_id: int, db: Session = Depends(get_db), login_user: AccessTokenPayload = Depends(get_current_user)):
    return controller.inactive_patient(patient_id, login_user, db)
