import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ enum: ['doctor', 'patient'] })
  @IsEnum(['doctor', 'patient'], {
    message: "Role must be either 'doctor' or 'patient'",
  })
  type: 'doctor' | 'patient';

  @ApiProperty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class DoctorSignupDto {
  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\d{10}$/, { message: 'Phone must be a valid 10-digit number' })
  phone: string;

  @ApiProperty()
  @IsString({ message: 'Address must be a string' })
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  @MaxLength(300, { message: 'Address must not exceed 300 characters' })
  address: string;

  @ApiProperty()
  @IsString({ message: 'Designation must be a string' })
  @MinLength(3, { message: 'Designation must be at least 3 characters' })
  @MaxLength(100, { message: 'Designation must not exceed 100 characters' })
  designation: string;

  @ApiProperty()
  @IsString({ message: 'License number must be a string' })
  @MinLength(5, { message: 'License number must be at least 5 characters' })
  @MaxLength(50, { message: 'License number must not exceed 50 characters' })
  license: string;

  @ApiProperty()
  @IsString({ message: 'Specialization must be a string' })
  @MinLength(3, { message: 'Specialization must be at least 3 characters' })
  @MaxLength(100, { message: 'Specialization must not exceed 100 characters' })
  specialization: string;

  @ApiProperty()
  @IsInt({ message: 'Experience must be a whole number' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(80, { message: 'Experience must not exceed 80 years' })
  @IsOptional()
  experience?: number;

  @ApiProperty()
  @IsString({ message: 'Bio must be a string' })
  @MinLength(10, { message: 'Bio must be at least 10 characters' })
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  bio: string;

  @ApiProperty()
  @IsString({ message: 'Hospital name must be a string' })
  @MinLength(5, { message: 'Hospital name must be at least 5 characters' })
  @MaxLength(200, { message: 'Hospital name must not exceed 200 characters' })
  hospital: string;
}

export class SignupDto {
  @ApiProperty({ enum: ['doctor', 'patient'] })
  @IsEnum(['doctor', 'patient'], {
    message: "Role must be either 'doctor' or 'patient'",
  })
  type: 'doctor' | 'patient';

  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  // Doctor-specific fields (optional, only used when type='doctor')
  @ApiProperty({ required: false })
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\d{10}$/, { message: 'Phone must be a valid 10-digit number' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'Address must be a string' })
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  @MaxLength(300, { message: 'Address must not exceed 300 characters' })
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'Designation must be a string' })
  @MinLength(3, { message: 'Designation must be at least 3 characters' })
  @MaxLength(100, { message: 'Designation must not exceed 100 characters' })
  @IsOptional()
  designation?: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'License number must be a string' })
  @MinLength(5, { message: 'License number must be at least 5 characters' })
  @MaxLength(50, { message: 'License number must not exceed 50 characters' })
  @IsOptional()
  license?: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'Specialization must be a string' })
  @MinLength(3, { message: 'Specialization must be at least 3 characters' })
  @MaxLength(100, { message: 'Specialization must not exceed 100 characters' })
  @IsOptional()
  specialization?: string;

  @ApiProperty({ required: false })
  @IsInt({ message: 'Experience must be a whole number' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(80, { message: 'Experience must not exceed 80 years' })
  @IsOptional()
  experience?: number;

  @ApiProperty({ required: false })
  @IsString({ message: 'Bio must be a string' })
  @MinLength(10, { message: 'Bio must be at least 10 characters' })
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'Hospital name must be a string' })
  @MinLength(5, { message: 'Hospital name must be at least 5 characters' })
  @MaxLength(200, { message: 'Hospital name must not exceed 200 characters' })
  @IsOptional()
  hospital?: string;
}

export class PatientSignupDto {
  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
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

export class SearchUsersQueryDto {
  @ApiPropertyOptional({
    enum: ['doctor', 'patient'],
    description: 'Filter by user role',
  })
  @IsEnum(['doctor', 'patient'], {
    message: "Role must be either 'doctor' or 'patient'",
  })
  @IsOptional()
  role?: 'doctor' | 'patient';

  @ApiPropertyOptional({
    description: 'Partial, case-insensitive email search',
  })
  @IsString({ message: 'Email search term must be a string' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Page number (default: 1)', default: 1 })
  @Type(() => Number)
  @IsInt({ message: 'Page must be a whole number' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page, max 100 (default: 10)',
    default: 10,
  })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be a whole number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @IsOptional()
  limit?: number = 10;
}

export class UpdateDoctorProfileDto {
  @ApiPropertyOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\d{10}$/, { message: 'Phone must be a valid 10-digit number' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Address must be a string' })
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  @MaxLength(300, { message: 'Address must not exceed 300 characters' })
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Designation must be a string' })
  @MinLength(3, { message: 'Designation must be at least 3 characters' })
  @MaxLength(100, { message: 'Designation must not exceed 100 characters' })
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'License number must be a string' })
  @MinLength(5, { message: 'License number must be at least 5 characters' })
  @MaxLength(50, { message: 'License number must not exceed 50 characters' })
  @IsOptional()
  license?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Specialization must be a string' })
  @MinLength(3, { message: 'Specialization must be at least 3 characters' })
  @MaxLength(100, { message: 'Specialization must not exceed 100 characters' })
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional()
  @IsInt({ message: 'Experience must be a whole number' })
  @Min(0, { message: 'Experience cannot be negative' })
  @Max(80, { message: 'Experience must not exceed 80 years' })
  @IsOptional()
  experience?: number;

  @ApiPropertyOptional()
  @IsString({ message: 'Bio must be a string' })
  @MinLength(10, { message: 'Bio must be at least 10 characters' })
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString({ message: 'Hospital name must be a string' })
  @MinLength(5, { message: 'Hospital name must be at least 5 characters' })
  @MaxLength(200, { message: 'Hospital name must not exceed 200 characters' })
  @IsOptional()
  hospital?: string;
}

export class UpdatePatientProfileDto {
  @ApiPropertyOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @IsOptional()
  name?: string;
}
