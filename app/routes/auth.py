from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import auth as controller
from ..deps import get_db
from ..schemas import PatientCreate, DoctorCreate, LoginCreate

router = APIRouter(prefix='/api/auth', tags=['Auth'])


@router.post('/login')
async def signin(body: LoginCreate, db: Session = Depends(get_db)):
    return controller.login(body, db)


@router.post('/signup')
async def signup(body: DoctorCreate, db: Session = Depends(get_db)):
    return controller.signup(body, db)


@router.post('/logout')
async def logout():
    return controller.logout()
