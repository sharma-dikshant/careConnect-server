from fastapi import APIRouter, Header, Cookie
from pydantic import BaseModel

router = APIRouter(prefix='/users')

class User(BaseModel):
    name: str
    email: str
    phone: str | None = None
    
@router.post("/{user_id}")
async def create_user(user_id, user: User):
    return {"status": "success", "data": user}


@router.get('/login')
async def login(Host: str | None = Header(default=None),authToken: str | None = Cookie(default=None)):
    return {"token": authToken, "header": Host}