from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import users as controller
from ..deps import get_db
from ..oauth2 import get_current_user
from ..schemas import AccessTokenPayload

router = APIRouter(prefix='/api/users', tags=['Users'])


@router.get("")
async def get_profile(login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.get_profile(login_user, db)


@router.patch("")
async def update_profile(login_user: AccessTokenPayload = Depends(get_current_user), db: Session = Depends(get_db)):
    return controller.update_profile(login_user, db)
