import { IsEmail, IsString, IsEnum, IsInt, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
  @IsEnum(['doctor', 'patient'])
  type: 'doctor' | 'patient';

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class DoctorSignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsString()
  designation: string;

  @IsString()
  license: string;

  @IsString()
  specialization: string;

  @IsInt()
  @IsOptional()
  experience?: number;

  @IsString()
  bio: string;

  @IsString()
  hospital: string;
}

export class AccessTokenPayloadDto {
  @IsInt()
  id: number;

  @IsEnum(['patient', 'doctor'])
  role: 'patient' | 'doctor';

  @IsString()
  name: string;

  @IsEmail()
  email: string;
}
