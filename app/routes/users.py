from fastapi import APIRouter, Header, Cookie
from pydantic import BaseModel
import controllers.users as controller

router = APIRouter(prefix='/api/users')


@router.patch("")
async def update_profile():
    return controller.update_profile()
