from fastapi import FastAPI
from api.routes.users import router as user_router

# def create_app() -> FastAPI:
def create_app():
    app = FastAPI()
    app.include_router(user_router)
    return app


app = create_app()


