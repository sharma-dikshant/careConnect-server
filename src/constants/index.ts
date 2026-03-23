export enum OTP_TYPE {
  SIGNUP_DOCTOR = 'signup-doctor',
  SIGNUP_PATIENT = 'signup-patient',
  APPOINTMENT_CREATE = 'appointment-create',
  APPOINTMENT_CLOSE = 'appointment-close',
}

export const OTP_KEYS = {
  tempDataKey: (type: OTP_TYPE, entityId: string) => `temp:${type}:${entityId}`,
  otpKey: (to: string, type: OTP_TYPE, entityId: string) =>
    `otp:${to}:${type}:${entityId}`,
  verifyTokenKey: (verifyToken: string) => `verifyToken:${verifyToken}`,
};

export enum EMAIL_TEMPLATES {
  WELCOME = 'welcome',
}
