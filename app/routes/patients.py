from fastapi import APIRouter, Depends
from ..controllers import patients as controller
from sqlalchemy.orm import Session
from ..schemas import PatientCreate, AccessTokenPayload
from ..deps import get_db
from ..oauth2 import get_current_user


router = APIRouter(prefix='/api/patients', tags=['Patients'])

@router.post('/')
async def add_patient(body: PatientCreate, db: Session = Depends(get_db), login_user: AccessTokenPayload = Depends(get_current_user)):
    return controller.add_patient(body, db)


@router.post('/inactive/{patient_id}')
async def inactive():
    return controller.inactive_patient()

