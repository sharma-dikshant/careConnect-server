import os
import uuid
import shutil
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from ..schemas import AccessTokenPayload, ApiResponse
from ..models import GlobalContext, LocalContext, Appointment


UPLOAD_DIR = "uploads/"
allowed_ext = ['.pdf']


def add_global_context(context: UploadFile, login_user: AccessTokenPayload, db: Session):
    # create global folder if not exits
    doctor_folder = os.path.join(UPLOAD_DIR, "globals", str(login_user.id))
    os.makedirs(doctor_folder, exist_ok=True)

    # validate extension
    ext = os.path.splitext(context.filename)[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            detail=f"File type {ext} not allowed.")

    # Generate unique file name
    filename = f"{uuid.uuid4()}_{context.filename}"
    filepath = os.path.join(doctor_folder, filename)
    filepath = filepath.replace("\\", "/")
    # save locally
    try:
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(context.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    new_g_context = GlobalContext(doctor_id=login_user.id, file=filepath)
    try:
        db.add(new_g_context)
        db.commit()
        db.refresh(new_g_context)
    except:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"failed to add global contxt {new_g_context}")

    return ApiResponse(message="success", data={"file": filepath})


def add_patient_context(appointment_id: int, context: UploadFile, login_user: AccessTokenPayload, db: Session):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.doctor_id == login_user.id).first()

    if not appointment:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            f"you're not allow to add context to appointment id: {appointment_id}")

    # make dir
    appointment_folder = os.path.join(
        UPLOAD_DIR, "locals", str(appointment_id))
    os.makedirs(appointment_folder, exist_ok=True)

    # validate extension
    ext = os.path.splitext(context.filename)[1].lower()

    if ext not in allowed_ext:
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            f"file type {ext} is not allowed")

    # generate unique file name
    filename = f"{uuid.uuid4()}_{context.filename}"
    filepath = os.path.join(appointment_folder, filename)
    filepath = filepath.replace("\\", '/')

    # save file
    try:
        with open(filepath, 'wb') as buffer:
            shutil.copyfileobj(context.file, buffer)
    except Exception as e:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"failed to save file {str(e)}")

    new_l_context = LocalContext(
        appointment_id=appointment_id, file=filepath)

    try:
        db.add(new_l_context)
        db.commit()
        db.refresh(new_l_context)
    except:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to add patient contxt {new_l_context}")

    return ApiResponse(message="success", data={"file": filepath})


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
