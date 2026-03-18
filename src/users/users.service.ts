import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import {
  AccessTokenPayloadDto,
  SearchUsersQueryDto,
  UpdateDoctorProfileDto,
  UpdatePatientProfileDto,
} from '../dto/auth.dto';
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
    updateDto: UpdateDoctorProfileDto | UpdatePatientProfileDto,
  ): Promise<ApiResponseDto> {
    if (loginUser.role === 'doctor') {
      const doctor = await this.doctorRepository.findOne({
        where: { id: loginUser.id },
      });

      if (!doctor) {
        return new ApiResponseDto('Doctor not found', null);
      }

      const dto = updateDto as UpdateDoctorProfileDto;
      Object.assign(doctor, dto);
      const updated = await this.doctorRepository.save(doctor);

      const { password, ...doctorData } = updated;
      return new ApiResponseDto('Profile updated successfully', doctorData);
    } else if (loginUser.role === 'patient') {
      const patient = await this.patientRepository.findOne({
        where: { id: loginUser.id },
      });

      if (!patient) {
        return new ApiResponseDto('Patient not found', null);
      }

      const dto = updateDto as UpdatePatientProfileDto;
      Object.assign(patient, dto);
      const updated = await this.patientRepository.save(patient);

      const { password, ...patientData } = updated;
      return new ApiResponseDto('Profile updated successfully', patientData);
    }

    return new ApiResponseDto('Invalid user role', null);
  }

  async getDoctor(
    doctorId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      return new ApiResponseDto('Doctor not found', null);
    }

    const { password, ...doctorData } = doctor;

    return new ApiResponseDto('Doctor fetched successfully', doctorData);
  }

  async getPatient(
    patientId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      return new ApiResponseDto('Patient not found', null);
    }

    const { password, ...patientData } = patient;

    return new ApiResponseDto('Patient fetched successfully', patientData);
  }

  async searchUsers(query: SearchUsersQueryDto): Promise<ApiResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const emailCondition = query.email ? ILike(`%${query.email}%`) : undefined;

    let doctors: Doctor[] = [];
    let doctorsTotal = 0;
    let patients: Patient[] = [];
    let patientsTotal = 0;

    if (!query.role || query.role === 'doctor') {
      const whereClause = emailCondition ? { email: emailCondition } : {};
      [doctors, doctorsTotal] = await this.doctorRepository.findAndCount({
        where: whereClause,
        select: [
          'id',
          'name',
          'email',
          'designation',
          'specialization',
          'hospital',
          'active',
          'created_at',
        ],
        ...(query.role === 'doctor' ? { skip, take: limit } : {}),
        order: { created_at: 'DESC' },
      });
    }

    if (!query.role || query.role === 'patient') {
      const whereClause = emailCondition ? { email: emailCondition } : {};
      [patients, patientsTotal] = await this.patientRepository.findAndCount({
        where: whereClause,
        select: ['id', 'name', 'email', 'active', 'created_at'],
        ...(query.role === 'patient' ? { skip, take: limit } : {}),
        order: { created_at: 'DESC' },
      });
    }

    // If a specific role is filtered, return paginated result for that role only
    if (query.role === 'doctor') {
      return new ApiResponseDto('Users retrieved successfully', {
        total: doctorsTotal,
        page,
        limit,
        data: doctors.map((d) => ({ ...d, role: 'doctor' })),
      });
    }

    if (query.role === 'patient') {
      return new ApiResponseDto('Users retrieved successfully', {
        total: patientsTotal,
        page,
        limit,
        data: patients.map((p) => ({ ...p, role: 'patient' })),
      });
    }

    // No role filter: merge both, then paginate
    const combined = [
      ...doctors.map((d) => ({ ...d, role: 'doctor' })),
      ...patients.map((p) => ({ ...p, role: 'patient' })),
    ];
    const total = doctorsTotal + patientsTotal;
    const paginated = combined.slice(skip, skip + limit);

    return new ApiResponseDto('Users retrieved successfully', {
      total,
      page,
      limit,
      data: paginated,
    });
  }
}
