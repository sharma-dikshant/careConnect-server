import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';
import { OTP_TYPE } from 'src/constants';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email address the OTP was sent to',
    example: 'doctor@example.com',
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'The 6-digit OTP received via email',
    example: '482910',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    description: 'The type of OTP flow',
    enum: OTP_TYPE,
    example: OTP_TYPE.SIGNUP_DOCTOR,
  })
  @IsEnum(OTP_TYPE)
  type: OTP_TYPE;
}
