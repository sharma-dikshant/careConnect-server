from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from ..controllers import contexts as controller
from ..deps import get_db
from ..schemas import AccessTokenPayload
from ..oauth2 import get_current_user

router = APIRouter(prefix='/api/contexts', tags=['Contexts'])


@router.post("/globals")
async def add_global_context(file: UploadFile = File(...), login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.add_global_context(file, login_user, db)


@router.get("/globals")
async def add_global_context(login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return {"data": f"global contexts of :{login_user.id}"}


@router.post("/locals/{appointment_id}")
async def add_patient_context(appointment_id, file: UploadFile = File(...), login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.add_patient_context(appointment_id, file, login_user, db)


@router.get("/locals/{appointment_id}")
async def add_patient_context(appointment_id, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return {"data": f"local contexts of appointment id: {appointment_id}"}


@router.delete("/globals/{context_id}")
async def remove_context(context_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.remove_global_context(context_id, login_user, db)


@router.delete("/locals/{context_id}")
async def remove_context(context_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    if login_user.role is not "doctor":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail="you're not allowed to perform this action")
    return controller.remove_local_context(context_id, login_user, db)
