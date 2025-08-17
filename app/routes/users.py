from fastapi import APIRouter, Header, Cookie
from pydantic import BaseModel
from ..controllers import users as controller

router = APIRouter(prefix='/api/users', tags=['Users'])


@router.patch("")
async def update_profile():
    return controller.update_profile()
