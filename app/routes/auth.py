from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import controllers.auth as controller
from deps import get_db
from schemas.schemas import PatientCreate, DoctorCreate

router = APIRouter(prefix='/api/auth')

@router.post('/login')
async def signin():
    return controller.login()


@router.post('/signup')
async def signup(body: DoctorCreate, db: Session = Depends(get_db)):
    return controller.signup(body, db)


@router.post('/logout')
async def logout():
    return controller.logout()