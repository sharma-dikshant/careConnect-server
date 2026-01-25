from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.schemas import PatientCreate, AccessTokenPayload, ApiResponse, PatientBase
from app.db.models import Patient, Appointment, Doctor
from app.utils import hash_password


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


def get_all_patients(doctor_id: int, login_user: AccessTokenPayload, db: Session):
    """Get all patients for a specific doctor"""
    # Verify the doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Get all appointments for this doctor
    appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.active == True
    ).all()
    
    # Get patient details for each appointment
    patients = []
    for appointment in appointments:
        patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
        if patient:
            patient_data = {
                "id": patient.id,
                "name": patient.name,
                "email": patient.email,
                "phone": getattr(patient, 'phone', ''),
                "age": getattr(patient, 'age', ''),
                "gender": getattr(patient, 'gender', ''),
                "address": getattr(patient, 'address', ''),
                "emergencyContact": getattr(patient, 'emergency_contact', ''),
                "medicalHistory": getattr(patient, 'medical_history', ''),
                "allergies": getattr(patient, 'allergies', ''),
                "currentMedications": getattr(patient, 'current_medications', ''),
                "status": "Active" if appointment.active else "Inactive",
                "medicalId": f"MED{patient.id:03d}",
                "lastVisit": appointment.created_at.strftime("%Y-%m-%d") if appointment.created_at else None,
                "appointmentId": appointment.id
            }
            patients.append(patient_data)
    
    return ApiResponse(message="Patients retrieved successfully", data=patients)


def get_patient(patient_id: int, login_user: AccessTokenPayload, db: Session):
    """Get a specific patient by ID"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    # Check if this patient has an appointment with the current doctor
    appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.doctor_id == login_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You don't have access to this patient")
    
    patient_data = {
        "id": patient.id,
        "name": patient.name,
        "email": patient.email,
        "phone": getattr(patient, 'phone', ''),
        "age": getattr(patient, 'age', ''),
        "gender": getattr(patient, 'gender', ''),
        "address": getattr(patient, 'address', ''),
        "emergencyContact": getattr(patient, 'emergency_contact', ''),
        "medicalHistory": getattr(patient, 'medical_history', ''),
        "allergies": getattr(patient, 'allergies', ''),
        "currentMedications": getattr(patient, 'current_medications', ''),
        "status": "Active" if appointment.active else "Inactive",
        "medicalId": f"MED{patient.id:03d}",
        "lastVisit": appointment.created_at.strftime("%Y-%m-%d") if appointment.created_at else None,
        "appointmentId": appointment.id
    }
    
    return ApiResponse(message="Patient retrieved successfully", data=patient_data)


def update_patient(patient_id: int, patient_data: dict, login_user: AccessTokenPayload, db: Session):
    """Update a patient's information"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    # Check if this patient has an appointment with the current doctor
    appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.doctor_id == login_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You don't have access to this patient")
    
    try:
        # Update patient fields
        for field, value in patient_data.items():
            if hasattr(patient, field) and field not in ['id', 'created_at']:
                setattr(patient, field, value)
        
        db.commit()
        db.refresh(patient)
        
        return ApiResponse(message="Patient updated successfully", data=PatientBase.model_validate(patient))
    except Exception as e:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update patient")


def delete_patient(patient_id: int, login_user: AccessTokenPayload, db: Session):
    """Delete a patient (soft delete by deactivating appointment)"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    # Check if this patient has an appointment with the current doctor
    appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.doctor_id == login_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You don't have access to this patient")
    
    try:
        # Soft delete by deactivating the appointment
        appointment.active = False
        db.commit()
        
        return ApiResponse(message="Patient removed successfully", data=None)
    except Exception as e:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete patient")


def inactive_patient(patient_id: int, login_user: AccessTokenPayload, db: Session):
    """Deactivate a patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail=f"patient with id {patient_id} does not exist!")

    appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id, Appointment.doctor_id == login_user.id).first()

    if not appointment:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="You don't have access to this patient")

    try:
        appointment.active = False
        db.commit()
        db.refresh(appointment)
    except:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, f"failed to inactive patient")

    return ApiResponse(message="Patient deactivated successfully", data=None)
