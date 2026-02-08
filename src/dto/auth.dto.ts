import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEnum(['doctor', 'patient'])
  type: 'doctor' | 'patient';

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class DoctorSignupDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  designation: string;

  @ApiProperty()
  @IsString()
  license: string;

  @ApiProperty()
  @IsString()
  specialization: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  experience?: number;

  @ApiProperty()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsString()
  hospital: string;
}

export class AccessTokenPayloadDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsEnum(['patient', 'doctor'])
  role: 'patient' | 'doctor';

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;
}
