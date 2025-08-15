from fastapi import APIRouter

router = APIRouter(prefix='/auth')

@router.post('/login')
async def signin():
    return {"message":"success"}


@router.post('/signup')
async def signin():
    return {"message":"success"}


@router.post('/logout')
async def signin():
    return {"message":"success"}