from fastapi import APIRouter, Header, Cookie
from pydantic import BaseModel
from ..controllers import contexts as controller

router = APIRouter(prefix='/api/contexts')


@router.post("")
async def add_global_context():
    return controller.add_global_context()

@router.post("/{patient_id}")
async def add_patient_context():
    return controller.add_patient_context()


@router.delete("/{context_id}")
async def remove_context():
    return controller.remove_context()