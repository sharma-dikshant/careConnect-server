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
    const emailBody = prepareOtpEmailBody(type, otp);

    // store in cache
    await Promise.all([
      this.cacheManager.set(`${type}:${to}`, otp, 15 * 60 * 60 * 1000),
      this.cacheManager.set(`data-${type}:${to}`, data, 15 * 60 * 60 * 1000),
    ]);

    // sendemail
    emailUtility
      .send(to, emailSubject, emailBody)
      .then(() => {
        console.log(`otp ${type} send to ${to} successfully`);
      })
      .catch((err) => {
        console.log(`failed to send ${type} otp to ${to}. Error: ${err}`);
      });
  }
  async verifyOtp(to: string, type: OTP_TYPE, otp: string) {
    // find key
    const data = await this.cacheManager.get(`${type}:${to}`);
    if (!data || data !== otp) {
      throw new UnauthorizedException('invalid otp or credentials');
    }

    // get otp related data
    const otpData = await this.cacheManager.get(`data-${type}:${to}`);

    // perform action
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
}
