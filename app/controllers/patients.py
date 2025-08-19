from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..schemas import PatientCreate, AccessTokenPayload, ApiResponse, PatientBase
from ..models import Patient, Appointment
from ..utils import hash_password


def add_patient(body: PatientCreate, login_user: AccessTokenPayload, db: Session):
    existing = db.query(Patient).filter(Patient.email == body.email).first()

    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            detail=f"user with email {body.email} already exists")

    new_patient = Patient(**body.model_dump())
    new_patient.password = hash_password(body.password)

    try:
        db.add(new_patient)
        db.flush()

        new_appointment = Appointment(
            patient_id=new_patient.id, doctor_id=login_user.id)
        db.add(new_appointment)

        db.commit()
        db.refresh(new_patient)
        db.refresh(new_appointment)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, f"failed to add patient")

    return ApiResponse(message="success", data=PatientBase.model_validate(new_patient))


def inactive_patient(patient_id: int, login_user: AccessTokenPayload, db: Session):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail=f"patient with id {patient_id} does not exist!")

    appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id, Appointment.doctor_id == login_user.id).first()

    try:
        appointment.active = False
        db.commit()
        db.refresh(appointment)
    except:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, f"failed to inactive patient")

    return {"message": "success", "data": f"inactive patient {patient_id}'s appointment"}
