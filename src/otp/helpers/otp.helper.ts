import { OTP_TYPE } from 'src/constants';

export function generateOtp(): string {
  return String(Math.round(Math.random() * 10000));
}

export function prepareOtpEmailSubject(type: OTP_TYPE) {
  switch (type) {
    case OTP_TYPE.SIGNUP_DOCTOR:
      return 'Doctor Register Otp | CareConnect';
    case OTP_TYPE.SIGNUP_PATIENT:
      return 'Patient Register Otp | CareConnect';
    case OTP_TYPE.APPOINTMENT_CREATE:
      return 'Appointment Start Confirmation Otp | CareConnect';
    case OTP_TYPE.APPOINTMENT_CLOSE:
      return 'Appointment Close Confirmation Otp | CareConnect';
    default:
      throw new Error(`invalid otp type ${type}`);
  }
}

export function prepareOtpEmailBody(type: OTP_TYPE, otp: string) {
  switch (type) {
    case OTP_TYPE.SIGNUP_DOCTOR:
      return `your register otp is ${otp}`;
    case OTP_TYPE.SIGNUP_PATIENT:
      return `your register otp is ${otp}`;
    case OTP_TYPE.APPOINTMENT_CREATE:
      return `your otp is ${otp}`;
    case OTP_TYPE.APPOINTMENT_CLOSE:
      return `your otp is ${otp}`;
    default:
      throw new Error(`invalid otp type ${type}`);
  }
}
