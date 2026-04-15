import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class PatientCreateDto {
  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

export class PatientUpdateDto {
  @ApiProperty()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^\d{10}$/, { message: 'Phone must be a valid 10-digit number' })
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsInt({ message: 'Age must be a whole number' })
  @Min(0, { message: 'Age cannot be negative' })
  @Max(150, { message: 'Please enter a valid age' })
  @IsOptional()
  age?: number;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  @IsEnum(['male', 'female', 'other'], {
    message: "Gender must be 'male', 'female', or 'other'",
  })
  @IsOptional()
  gender?: string;

  @ApiProperty()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(300, { message: 'Address must not exceed 300 characters' })
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString({ message: 'Emergency contact must be a string' })
  @Matches(/^\d{10}$/, {
    message: 'Emergency contact must be a valid 10-digit number',
  })
  @IsOptional()
  emergencyContact?: string;

  @ApiProperty()
  @IsString({ message: 'Medical history must be a string' })
  @MaxLength(2000, {
    message: 'Medical history must not exceed 2000 characters',
  })
  @IsOptional()
  medicalHistory?: string;

  @ApiProperty()
  @IsString({ message: 'Allergies must be a string' })
  @MaxLength(1000, { message: 'Allergies must not exceed 1000 characters' })
  @IsOptional()
  allergies?: string;

  @ApiProperty()
  @IsString({ message: 'Current medications must be a string' })
  @MaxLength(1000, {
    message: 'Current medications must not exceed 1000 characters',
  })
  @IsOptional()
  currentMedications?: string;

  @ApiProperty()
  @IsString({ message: 'Status must be a string' })
  @IsOptional()
  status?: string;
}

export class PatientResponseDto {
  id: number;
  name: string;
  email: string;
}
