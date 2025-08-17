from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .deps import get_db
from .models import Doctor, Patient
from .schemas import AccessTokenPayload


SECRET_KEY = "my_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    # set token expiry (default: ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    # add "exp" claim required by JWT for expiration
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str, crediential_expection) -> AccessTokenPayload:
    try:
        payload = jwt.decode(token=token, key=SECRET_KEY,
                             algorithms=[ALGORITHM])
        token_data = AccessTokenPayload(**payload)
    except JWTError:
        raise crediential_expection

    return token_data


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    crediential_expection = HTTPException(
        status.HTTP_401_UNAUTHORIZED, detail="could not validate crediential")

    token_data = verify_access_token(token, crediential_expection)
    user = None
    if token_data.role == 'doctor':
        user = db.query(Doctor).filter(Doctor.id == token_data.id).first()
    elif token_data.role == 'patient':
        user = db.query(Patient).filter(Patient.id == token_data.id).first()

    if user is None:
        raise crediential_expection
    return user
