from sqlalchemy.orm import Session
from app.db.models import Doctor, Patient
from app.schemas import AccessTokenPayload, ApiResponse


def get_profile(login_user: AccessTokenPayload, db: Session):
    if login_user.role == "doctor":
        doctor = db.query(Doctor).filter(Doctor.id == login_user.id).first()
        if not doctor:
            return {"message": "Doctor not found", "data": None}
        
        profile_data = {
            "id": doctor.id,
            "name": doctor.name,
            "email": doctor.email,
            "phone": doctor.phone,
            "address": doctor.address,
            "designation": doctor.designation,
            "license": doctor.license,
            "specialization": doctor.specialization,
            "experience": doctor.experience,
            "bio": doctor.bio,
            "hospital": doctor.hospital,
            "active": doctor.active,
            "created_at": doctor.created_at
        }
        return ApiResponse(message="Profile retrieved successfully", data=profile_data)
    
    elif login_user.role == "patient":
        patient = db.query(Patient).filter(Patient.id == login_user.id).first()
        if not patient:
            return {"message": "Patient not found", "data": None}
        
        profile_data = {
            "id": patient.id,
            "name": patient.name,
            "email": patient.email,
            "active": patient.active,
            "created_at": patient.created_at
        }
        return ApiResponse(message="Profile retrieved successfully", data=profile_data)
    
    return {"message": "Invalid user role", "data": None}


def update_profile(login_user: AccessTokenPayload, db: Session):
    return {"message": "success", "data": "update profile"}

