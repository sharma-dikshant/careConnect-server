import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsInt,
  MinLength,
} from 'class-validator';

export class PatientCreateDto {
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

export class PatientUpdateDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  age?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currentMedications?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  status?: string;
}

export class PatientResponseDto {
  id: number;
  name: string;
  email: string;
}
