import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { OTP_KEYS, OTP_TYPE } from '../constants/index';
import { generateOtp } from './helpers/otp.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import emailUtility from '../utils/email.util';

import { ResendOtpDto, VerifyOtpDto } from '../dto/verify-otp.dto';
import { randomUUID } from 'node:crypto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async sendOtp(to: string, type: OTP_TYPE, entityId: string) {
    const otpExpiry = 15;
    const otp = generateOtp();
    const otpKey = OTP_KEYS.otpKey(to, type, entityId);

    // store otp
    await this.cacheManager.set(otpKey, otp, otpExpiry * 60 * 1000);
    // console.log(`otp send successfulty to ${to}: ${otp}`);

    // send email
    emailUtility
      .sendOtpEmail(to, type, otp)
      .then(() => {
        console.log(`otp ${type} sent to ${to} successfully`);
      })
      .catch((err) => {
        console.log(`failed to send ${type} otp to ${to}. Error: ${err}`);
      });

    return { otpExpiry };
  }

  async verifyOtp(data: VerifyOtpDto) {
    const { to, otp, type, entityId } = data;
    const otpKey = OTP_KEYS.otpKey(to, type, entityId);

    // fetch and verify otp
    const cachedOtp = await this.cacheManager.get(otpKey);

    if (!cachedOtp) {
      throw new BadRequestException('please retry sending otp again.');
    }

    if (cachedOtp !== otp) {
      throw new ForbiddenException('invalid otp.');
    }

    // generate verify token
    const verifyToken = randomUUID();
    const verifyKey = OTP_KEYS.verifyTokenKey(verifyToken);

    // store verifyToken details
    await this.cacheManager.set(verifyKey, { to, type, entityId });

    return new ApiResponseDto('otp verified successfully.', { verifyToken });
  }

  async resendOtp(data: ResendOtpDto) {
    const tempDataKey = OTP_KEYS.tempDataKey(data.type, data.entityId);

    if (!tempDataKey) {
      throw new BadRequestException('please retry the operation.');
    }

    // send new Otp
    const { otpExpiry } = await this.sendOtp(data.to, data.type, data.entityId);
    return new ApiResponseDto('otp send successfully', {
      otpExpiry,
      entityId: data.entityId,
    });
  }
}
