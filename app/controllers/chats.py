from fastapi import HTTPException, status
from ..schemas import ApiResponse, MessageCreate, AccessTokenPayload
from sqlalchemy.orm import Session
from ..models import Message, Appointment
import time


def send_bot_message(body: MessageCreate, login_user: AccessTokenPayload, appointment_id: int, db: Session):
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id, Appointment.patient_id == login_user.id).first()

    if not appointment:
        raise HTTPException(status.HTTP_404_NOT_FOUND,
                            f"no appointment with id: {appointment_id}")
    # save patient message to db
    try:
        new_msg = Message(appointment_id=appointment_id,
                          sender=body.sender, message=body.message)

        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
    except:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "failed to send message")

    # TODO integrate LLM
    bot_resp = f"this is response from bot for {body.message}"
    time.sleep(10)

    try:
        new_msg = Message(appointment_id=appointment_id,
                          sender="bot", message=bot_resp)

        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)
    except:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "failed to send message")

    # save bot response to db
    return ApiResponse(message="success", data={"message": f"{bot_resp}"})
