import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async getProfile(loginUser: AccessTokenPayloadDto): Promise<ApiResponseDto> {
    if (loginUser.role === 'doctor') {
      const doctor = await this.doctorRepository.findOne({
        where: { id: loginUser.id },
      });

      if (!doctor) {
        return new ApiResponseDto('Doctor not found', null);
      }

      const profileData = {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        address: doctor.address,
        designation: doctor.designation,
        license: doctor.license,
        specialization: doctor.specialization,
        experience: doctor.experience,
        bio: doctor.bio,
        hospital: doctor.hospital,
        active: doctor.active,
        created_at: doctor.created_at,
      };

      return new ApiResponseDto('Profile retrieved successfully', profileData);
    } else if (loginUser.role === 'patient') {
      const patient = await this.patientRepository.findOne({
        where: { id: loginUser.id },
      });

      if (!patient) {
        return new ApiResponseDto('Patient not found', null);
      }

      const profileData = {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        active: patient.active,
        created_at: patient.created_at,
      };

      return new ApiResponseDto('Profile retrieved successfully', profileData);
    }

    return new ApiResponseDto('Invalid user role', null);
  }

  async updateProfile(
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    return new ApiResponseDto('success', 'update profile');
  }
}
