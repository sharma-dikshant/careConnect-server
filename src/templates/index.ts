import { signupOtpTemplate } from './signup-otp.template';
import { welcomeTemplate } from './welcome.template';
import { appointmentCreateOtpTemplate } from './appointment-create-otp.template';
import { appointmentCloseOtpTemplate } from './appointment-close-otp.template';

export enum EMAIL_TEMPLATE {
  SIGNUP_OTP = 'signup-otp',
  WELCOME = 'welcome',
  APPOINTMENT_CREATE_OTP = 'appointment-create-otp',
  APPOINTMENT_CLOSE_OTP = 'appointment-close-otp',
}

export type TemplateData = {
  [EMAIL_TEMPLATE.SIGNUP_OTP]: { name: string; otp: string };
  [EMAIL_TEMPLATE.WELCOME]: { name: string; role: 'doctor' | 'patient' };
  [EMAIL_TEMPLATE.APPOINTMENT_CREATE_OTP]: { name: string; otp: string };
  [EMAIL_TEMPLATE.APPOINTMENT_CLOSE_OTP]: { name: string; otp: string };
};

export function getEmailTemplate<T extends EMAIL_TEMPLATE>(
  template: T,
  data: TemplateData[T],
): string {
  switch (template) {
    case EMAIL_TEMPLATE.SIGNUP_OTP: {
      const { name, otp } = data as TemplateData[EMAIL_TEMPLATE.SIGNUP_OTP];
      return signupOtpTemplate(name, otp);
    }
    case EMAIL_TEMPLATE.WELCOME: {
      const { name, role } = data as TemplateData[EMAIL_TEMPLATE.WELCOME];
      return welcomeTemplate(name, role);
    }
    case EMAIL_TEMPLATE.APPOINTMENT_CREATE_OTP: {
      const { name, otp } =
        data as TemplateData[EMAIL_TEMPLATE.APPOINTMENT_CREATE_OTP];
      return appointmentCreateOtpTemplate(name, otp);
    }
    case EMAIL_TEMPLATE.APPOINTMENT_CLOSE_OTP: {
      const { name, otp } =
        data as TemplateData[EMAIL_TEMPLATE.APPOINTMENT_CLOSE_OTP];
      return appointmentCloseOtpTemplate(name, otp);
    }
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
