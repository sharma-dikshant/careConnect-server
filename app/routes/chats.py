from fastapi import APIRouter, Depends, HTTPException, status
from ..controllers import chats as controller
from sqlalchemy.orm import Session
from ..schemas import MessageCreate, AccessTokenPayload
from ..deps import get_db
from ..oauth2 import get_current_user


router = APIRouter(prefix="/api/chats", tags=['Chat'])


@router.post("/{appointment_id}")
def get_query(body: MessageCreate, appointment_id: int, login_user: AccessTokenPayload = Depends(get_current_user),  db: Session = Depends(get_db)):
    if login_user.role != "patient":
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            "this service is only for patients")
    return controller.send_bot_message(body, login_user, appointment_id, db)


@router.get("/{appointment_id}")
def get_query(appointment_id: int, login_user: AccessTokenPayload = Depends(get_current_user),  db: Session = Depends(get_db)):
    return {"data": f"all chats of {appointment_id}"}
