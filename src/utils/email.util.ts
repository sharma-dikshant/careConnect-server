import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

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

  async send(to: string, subject: string, message: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text: message,
      });
    } catch (err) {
      console.error('Email failed:', err);
      throw err;
    }
  }
}

const emailUtility = new Email();
export default emailUtility;
