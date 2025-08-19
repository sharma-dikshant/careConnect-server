from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..controllers import contexts as controller
from ..deps import get_db
from ..schemas import AccessTokenPayload, CreateContext
from ..oauth2 import get_current_user

router = APIRouter(prefix='/api/contexts', tags=['Contexts'])


@router.post("/")
async def add_global_context(body: CreateContext, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.add_global_context(body, login_user, db)


@router.post("/{appointment_id}")
async def add_patient_context(body: CreateContext, appointment_id, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.add_patient_context(body, appointment_id, login_user, db)


@router.delete("/globals/{context_id}")
async def remove_context(context_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.remove_global_context(context_id, login_user, db)


@router.delete("/locals/{context_id}")
async def remove_context(context_id: int, login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.remove_local_context(context_id, login_user, db)
