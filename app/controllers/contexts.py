from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..schemas import CreateContext, AccessTokenPayload, ApiResponse
from ..models import GlobalContext, LocalContext, Appointment


def add_global_context(context: CreateContext, login_user: AccessTokenPayload, db: Session):
    new_g_context = GlobalContext(doctor_id=login_user.id, file=context.file)

    try:
        db.add(new_g_context)
        db.commit()
        db.refresh(new_g_context)
    except:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to add global contxt {new_g_context}")

    return ApiResponse(message="success", data=CreateContext.model_validate(new_g_context))


def add_patient_context(context: CreateContext, appointment_id: int, login_user: AccessTokenPayload, db: Session):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.doctor_id == login_user.id).first()

    if not appointment:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            f"you're not allow to add context to appointment id: {appointment_id}")

    new_l_context = LocalContext(
        appointment_id=appointment_id, file=context.file)

    try:
        db.add(new_l_context)
        db.commit()
        db.refresh(new_l_context)
    except:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to add global contxt {new_l_context}")

    return ApiResponse(message="success", data=CreateContext.model_validate(new_l_context))


def remove_global_context():
    return ApiResponse(message="success", data="removed context")


def add_global_context(context: CreateContext, login_user: AccessTokenPayload, db: Session):
    new_g_context = GlobalContext(doctor_id=login_user.id, file=context.file)

    try:
        db.add(new_g_context)
        db.commit()
        db.refresh(new_g_context)
    except:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to add global contxt {new_g_context}")

    return ApiResponse(message="success", data=CreateContext.model_validate(new_g_context))


def add_patient_context(context: CreateContext, appointment_id: int, login_user: AccessTokenPayload, db: Session):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.doctor_id == login_user.id).first()

    if not appointment:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            f"you're not allow to add context to appointment id: {appointment_id}")

    new_l_context = LocalContext(
        appointment_id=appointment_id, file=context.file)

    try:
        db.add(new_l_context)
        db.commit()
        db.refresh(new_l_context)
    except:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            f"failed to add global contxt {new_l_context}")

    return ApiResponse(message="success", data=CreateContext.model_validate(new_l_context))


def remove_global_context(context_id: int, login_user: AccessTokenPayload, db: Session):
    context = db.query(GlobalContext).filter(
        GlobalContext.id == context_id).first()
    if not context:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            detail=f"no global context found with id: {context_id}")

    if context.doctor_id != login_user.id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            detail=f"global context {context_id} doesn't belongs to you")

    context.active = False
    db.commit()
    db.refresh(context)
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

    valid_context.active = False
    db.commit()
    db.refresh(valid_context)
    return ApiResponse(message="success", data="inactive global context")
