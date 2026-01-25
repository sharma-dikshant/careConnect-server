from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.services import users as controller
from app.api.deps import get_db
from app.core.security import get_current_user
from app.schemas import AccessTokenPayload

router = APIRouter(prefix='/api/users', tags=['Users'])


@router.get("")
async def get_profile(login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.get_profile(login_user, db)


@router.patch("")
async def update_profile(login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.update_profile(login_user, db)
