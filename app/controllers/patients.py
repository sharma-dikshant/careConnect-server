from sqlalchemy.orm import Session
from ..schemas import PatientCreate
from ..models import Patient
from ..utils import hash_password


def add_patient(body: PatientCreate, db: Session):
    new_patient = Patient(**body.model_dump())
    new_patient.password = hash_password(body.password)
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return {"message": "success", "data": new_patient}


def inactive_patient():
    return {"message": "success", "data": "inactive patient"}
