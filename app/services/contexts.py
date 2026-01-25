import os
import uuid
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.schemas import AccessTokenPayload, ApiResponse
from app.db.models import GlobalContext, LocalContext, Appointment
from app.services.s3 import upload_file_to_s3

allowed_ext = ['.pdf']


def add_global_context(context: UploadFile, login_user: AccessTokenPayload, db: Session):
    # validate extension
    ext = os.path.splitext(context.filename)[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            detail=f"File type {ext} not allowed.")

    # Generate unique file name/key
    filename = f"{uuid.uuid4()}_{context.filename}"
    object_name = f"globals/{login_user.id}/{filename}"
    
    # Upload to S3
    file_url = upload_file_to_s3(context.file, object_name)

    new_g_context = GlobalContext(doctor_id=login_user.id, file=file_url)
    try:
        db.add(new_g_context)
        db.commit()
        db.refresh(new_g_context)
    except:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"failed to add global contxt {new_g_context}")

    return ApiResponse(message="success", data={"file": file_url})


def add_patient_context(appointment_id: int, context: UploadFile, login_user: AccessTokenPayload, db: Session):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.doctor_id == login_user.id).first()

    if not appointment:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            f"you're not allow to add context to appointment id: {appointment_id}")

    # validate extension
    ext = os.path.splitext(context.filename)[1].lower()

    if ext not in allowed_ext:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            f"file type {ext} is not allowed")

    # generate unique file name/key
    filename = f"{uuid.uuid4()}_{context.filename}"
    object_name = f"locals/{appointment_id}/{filename}"

    # Upload to S3
    file_url = upload_file_to_s3(context.file, object_name)

    new_l_context = LocalContext(
        appointment_id=appointment_id, file=file_url)

    try:
        db.add(new_l_context)
        db.commit()
        db.refresh(new_l_context)
    except:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to add patient contxt {new_l_context}")

    return ApiResponse(message="success", data={"file": file_url})


def remove_global_context(context_id: int, login_user: AccessTokenPayload, db: Session):
    context = db.query(GlobalContext).filter(
        GlobalContext.id == context_id).first()
    if not context:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail=f"no global context found with id: {context_id}")

    if context.doctor_id != login_user.id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail=f"global context {context_id} doesn't belongs to you")
    try:
        context.active = False
        db.commit()
        db.refresh(context)
    except:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to remove global context {context_id}")
    return ApiResponse(message="success", data="inactive global context")


def remove_local_context(context_id: int, login_user: AccessTokenPayload, db: Session):
    context = db.query(LocalContext).filter(
        LocalContext.id == context_id).first()
    if not context:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail=f"no global context found with id: {context_id}")

    valid_context = (
        db.query(LocalContext).join(Appointment, LocalContext.appointment_id == Appointment.id).filter(
            LocalContext.id == context_id, Appointment.doctor_id == login_user.id)
    ).first()

    if not valid_context:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail=f"local context {context_id} doesn't belongs to you")

    try:
        valid_context.active = False
        db.commit()
        db.refresh(valid_context)
    except:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to remove local context {context_id}")
    return ApiResponse(message="success", data="inactive global context")
