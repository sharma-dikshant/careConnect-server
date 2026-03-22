import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verifies a one-time password sent to an email address. On success, executes the action associated with the OTP type (e.g. creates a doctor or patient account for signup flows).',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({
    description:
      'OTP verified successfully. Returns the result of the associated action (e.g. newly created account details for signup flows).',
    schema: {
      example: {
        message: 'account created successfully',
        data: {
          id: 1,
          name: 'Dr. John Doe',
          email: 'doctor@example.com',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'OTP is invalid or has expired.',
    schema: {
      example: {
        statusCode: 401,
        message: 'invalid otp or credentials',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'A user with the given email already exists.',
    schema: {
      example: {
        statusCode: 400,
        message: 'user with email doctor@example.com already exists',
      },
    },
  })
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.otpService.verifyOtp(data.to, data.type, data.otp);
  }
}
