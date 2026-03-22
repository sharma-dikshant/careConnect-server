import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { OTP_TYPE } from '../constants/index';
import {
  generateOtp,
  prepareOtpEmailBody,
  prepareOtpEmailSubject,
} from './helpers/otp.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import emailUtility from 'src/utils/email.util';
import { PatientsService } from 'src/patients/patients.service';
import { UsersService } from 'src/users/users.service';
import { DoctorSignupDto, PatientSignupDto } from 'src/dto/auth.dto';
import { EMAIL_TEMPLATE, getEmailTemplate } from 'src/templates';

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly patientService: PatientsService,
    private readonly doctorService: UsersService,
  ) {}

  async sendOtp(to: string, type: OTP_TYPE, data: any) {
    const otp = generateOtp();
    const emailSubject = prepareOtpEmailSubject(type);
    const emailBody = prepareOtpEmailBody(type, otp, data?.name ?? '');

    // store in cache
    await Promise.all([
      this.cacheManager.set(`${type}:${to}`, otp, 15 * 60 * 60 * 1000),
      this.cacheManager.set(`data-${type}:${to}`, data, 15 * 60 * 60 * 1000),
    ]);

    // send email
    emailUtility
      .send(to, emailSubject, emailBody)
      .then(() => {
        console.log(`otp ${type} sent to ${to} successfully`);
      })
      .catch((err) => {
        console.log(`failed to send ${type} otp to ${to}. Error: ${err}`);
      });
  }

  async verifyOtp(to: string, type: OTP_TYPE, otp: string) {
    // verify otp
    const cachedOtp = await this.cacheManager.get(`${type}:${to}`);
    if (!cachedOtp || cachedOtp !== otp) {
      throw new UnauthorizedException('invalid otp or credentials');
    }

    // get otp related data
    const otpData = await this.cacheManager.get(`data-${type}:${to}`);

    // clean up cache
    await Promise.all([
      this.cacheManager.del(`${type}:${to}`),
      this.cacheManager.del(`data-${type}:${to}`),
    ]);

    // perform action based on otp type
    switch (type) {
      case OTP_TYPE.SIGNUP_DOCTOR: {
        const doctorData = otpData as DoctorSignupDto;
        const result = await this.doctorService.addDoctor(doctorData);
        emailUtility
          .send(
            to,
            'Welcome to CareConnect!',
            getEmailTemplate(EMAIL_TEMPLATE.WELCOME, {
              name: doctorData.name,
              role: 'doctor',
            }),
          )
          .then(() => console.log(`welcome email sent to ${to}`))
          .catch((err) =>
            console.log(`failed to send welcome email to ${to}. Error: ${err}`),
          );
        return result;
      }

      case OTP_TYPE.SIGNUP_PATIENT: {
        const patientData = otpData as PatientSignupDto;
        const result = await this.patientService.registerPatient(patientData);
        emailUtility
          .send(
            to,
            'Welcome to CareConnect!',
            getEmailTemplate(EMAIL_TEMPLATE.WELCOME, {
              name: patientData.name,
              role: 'patient',
            }),
          )
          .then(() => console.log(`welcome email sent to ${to}`))
          .catch((err) =>
            console.log(`failed to send welcome email to ${to}. Error: ${err}`),
          );
        return result;
      }

      case OTP_TYPE.APPOINTMENT_CREATE:
        return `your otp is ${otp}`;

      case OTP_TYPE.APPOINTMENT_CLOSE:
        return `your otp is ${otp}`;

      default:
        throw new Error(`invalid otp type ${type}`);
    }
  }
}
