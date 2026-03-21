import { OTP_TYPE } from 'src/constants';
import { EMAIL_TEMPLATE, getEmailTemplate } from 'src/templates';

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function prepareOtpEmailSubject(type: OTP_TYPE): string {
  switch (type) {
    case OTP_TYPE.SIGNUP_DOCTOR:
      return 'Doctor Register OTP | CareConnect';
    case OTP_TYPE.SIGNUP_PATIENT:
      return 'Patient Register OTP | CareConnect';
    case OTP_TYPE.APPOINTMENT_CREATE:
      return 'Appointment Start Confirmation OTP | CareConnect';
    case OTP_TYPE.APPOINTMENT_CLOSE:
      return 'Appointment Close Confirmation OTP | CareConnect';
    default:
      throw new Error(`invalid otp type ${type}`);
  }
}

export function prepareOtpEmailBody(
  type: OTP_TYPE,
  otp: string,
  name: string,
): string {
  switch (type) {
    case OTP_TYPE.SIGNUP_DOCTOR:
    case OTP_TYPE.SIGNUP_PATIENT:
      return getEmailTemplate(EMAIL_TEMPLATE.SIGNUP_OTP, { name, otp });
    case OTP_TYPE.APPOINTMENT_CREATE:
      return getEmailTemplate(EMAIL_TEMPLATE.APPOINTMENT_CREATE_OTP, {
        name,
        otp,
      });
    case OTP_TYPE.APPOINTMENT_CLOSE:
      return getEmailTemplate(EMAIL_TEMPLATE.APPOINTMENT_CLOSE_OTP, {
        name,
        otp,
      });
    default:
      throw new Error(`invalid otp type ${type}`);
  }
}
