import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import { OTP_TYPE } from 'src/constants';
import { EMAIL_TEMPLATE, getEmailTemplate } from 'src/templates';

dotenv.config();

class Email {
  transporter: Transporter;

  constructor() {
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;

    if (!SMTP_PASS || !SMTP_USER) {
      throw new Error('missing email config');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.error('Email failed:', err);
      throw err;
    }
  }

  async sendOtpEmail(to: string, type: OTP_TYPE, otp: string) {
    try {
      let subject: string;
      let body: string;

      switch (type) {
        case OTP_TYPE.SIGNUP_DOCTOR:
          subject = 'Doctor Register OTP | CareConnect';
          body = getEmailTemplate(EMAIL_TEMPLATE.SIGNUP_OTP, { name: '', otp });
          break;

        case OTP_TYPE.SIGNUP_PATIENT:
          subject = 'Patient Register OTP | CareConnect';
          body = getEmailTemplate(EMAIL_TEMPLATE.SIGNUP_OTP, { name: '', otp });
          break;

        case OTP_TYPE.APPOINTMENT_CREATE:
          subject = 'Appointment Create OTP | CareConnect';
          body = getEmailTemplate(EMAIL_TEMPLATE.APPOINTMENT_CREATE_OTP, {
            name: '',
            otp,
          });
          break;

        case OTP_TYPE.APPOINTMENT_CLOSE:
          subject = 'Appointment Close OTP | CareConnect';
          body = getEmailTemplate(EMAIL_TEMPLATE.APPOINTMENT_CLOSE_OTP, {
            name: '',
            otp,
          });
          break;

        default:
          throw new Error(`invalid otp type ${type}`);
      }

      return await this.send(to, subject, body);
    } catch (error) {
      console.error('Failed to send OTP email:', {
        to,
        type,
        error,
      });

      throw new Error('Unable to send OTP email');
    }
  }
}

const emailUtility = new Email();
export default emailUtility;
