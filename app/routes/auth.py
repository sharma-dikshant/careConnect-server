from fastapi import APIRouter
import controllers.auth as controller

router = APIRouter(prefix='/api/auth')

@router.post('/login')
async def signin():
    return controller.login()


@router.post('/signup')
async def signup():
    return controller.signup()


@router.post('/logout')
async def logout():
    return controller.logout()