import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OTP_TYPE } from 'src/constants';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/verify')
  async verifyOtp(@Body() data: { otp: string; to: string; type: OTP_TYPE }) {
    return this.otpService.verifyOtp(data.to, data.type, data.otp);
  }
}
