import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class SignupDto {
  @ApiProperty({ enum: ['doctor', 'patient'] })
  @IsEnum(['doctor', 'patient'])
  type: 'doctor' | 'patient';

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

  // Doctor-specific fields (optional, only used when type='doctor')
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  license?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @IsOptional()
  experience?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hospital?: string;
}

export class PatientSignupDto {
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
  @ApiPropertyOptional({ enum: ['doctor', 'patient'], description: 'Filter by user role' })
  @IsEnum(['doctor', 'patient'])
  @IsOptional()
  role?: 'doctor' | 'patient';

  @ApiPropertyOptional({ description: 'Partial, case-insensitive email search' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Page number (default: 1)', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page, max 100 (default: 10)', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
