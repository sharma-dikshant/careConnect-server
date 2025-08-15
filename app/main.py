from fastapi import FastAPI
from db_config import SessionLocal, engine, Base
from routes.users import router as user_router
from routes.auth import router as auth_router
from routes.contexts import router as context_router
from routes.patients import router as patient_router


# def create_app() -> FastAPI:
def create_app():
    app = FastAPI(title="Care Connect")
    Base.metadata.create_all(bind=engine)
    app.include_router(auth_router)
    app.include_router(user_router)
    app.include_router(patient_router)
    app.include_router(context_router)
    return app


app = create_app()


