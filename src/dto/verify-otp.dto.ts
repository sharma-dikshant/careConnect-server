import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumberString,
  IsUUID,
  Length,
} from 'class-validator';
import { OTP_TYPE } from 'src/constants';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email address the OTP was sent to',
    example: 'doctor@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  to: string;

  @ApiProperty({
    description: 'The 6-digit OTP received via email',
    example: '482910',
  })
  @IsNumberString({}, { message: 'OTP must contain only digits' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({
    description: 'The type of OTP flow',
    enum: OTP_TYPE,
    example: OTP_TYPE.SIGNUP_DOCTOR,
  })
  @IsEnum(OTP_TYPE, { message: 'Invalid OTP type provided' })
  type: OTP_TYPE;

  @ApiProperty({
    description: 'entity Id',
    example: '',
  })
  @IsUUID(undefined, { message: 'Entity ID must be a valid UUID' })
  entityId: string;
}

export class ResendOtpDto {
  @ApiProperty({
    description: 'The email address the OTP was sent to',
    example: 'doctor@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  to: string;

  @ApiProperty({
    description: 'The type of OTP flow',
    enum: OTP_TYPE,
    example: OTP_TYPE.SIGNUP_DOCTOR,
  })
  @IsEnum(OTP_TYPE, { message: 'Invalid OTP type provided' })
  type: OTP_TYPE;

  @ApiProperty({
    description: 'entity Id',
    example: '',
  })
  @IsUUID(undefined, { message: 'Entity ID must be a valid UUID' })
  entityId: string;
}
