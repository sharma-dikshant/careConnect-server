from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import SessionLocal, engine
from app.db.models import Base
from app.api.v1.endpoints.users import router as user_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.contexts import router as context_router
from app.api.v1.endpoints.patients import router as patient_router
from app.api.v1.endpoints.chats import router as chat_router

app = FastAPI(title="Care Connect")


origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# def create_app() -> FastAPI:

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(patient_router)
app.include_router(context_router)
app.include_router(chat_router)


@app.get("/", tags=['root'])
def root():
    return {"message": "welcome to care Connect"}
