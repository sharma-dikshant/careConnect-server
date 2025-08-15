from fastapi import APIRouter
import controllers.patients as controller

router = APIRouter(prefix='/api/patients')

@router.post('/')
async def add_patient():
    return controller.add_patient()


@router.post('/inactive/{patient_id}')
async def inactive():
    return controller.inactive_patient()

