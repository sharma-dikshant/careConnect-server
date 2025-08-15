from fastapi import APIRouter, Header, Cookie
from pydantic import BaseModel
from schemas.schemas import User

router = APIRouter(prefix='/users')

    
@router.post("/{user_id}")
async def create_user(user_id, user: User):
    return {"status": "success", "data": user}


@router.get('/login')
async def login(Host: str | None = Header(default=None),authToken: str | None = Cookie(default=None)):
    return {"token": authToken, "header": Host}