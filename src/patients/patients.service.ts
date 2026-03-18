import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { PatientCreateDto, PatientUpdateDto } from '../dto/patient.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { hashPassword } from '../utils/password.util';
import { PaginationDto, paginate } from '../dto/pagination.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async addPatient(
    body: PatientCreateDto,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const existing = await this.patientRepository.findOne({
      where: { email: body.email },
    });

    if (existing) {
      throw new HttpException(
        `user with email ${body.email} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const hashedPassword = await hashPassword(body.password);
      const newPatient = this.patientRepository.create({
        ...body,
        password: hashedPassword,
      });

      await this.patientRepository.save(newPatient);

      const newAppointment = this.appointmentRepository.create({
        patient_id: newPatient.id,
        doctor_id: loginUser.id,
      });

      await this.appointmentRepository.save(newAppointment);

      return new ApiResponseDto('success', {
        id: newPatient.id,
        name: newPatient.name,
        email: newPatient.email,
      });
    } catch (error) {
      throw new HttpException(
        'failed to add patient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPatients(
    loginUser: AccessTokenPayloadDto,
    pagination: PaginationDto,
  ): Promise<ApiResponseDto> {
    const doctorId = loginUser.id;
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new HttpException('Doctor not found', HttpStatus.NOT_FOUND);
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [appointments, total] = await this.appointmentRepository.findAndCount(
      {
        where: { doctor_id: doctorId, active: true },
        relations: ['patient'],
        order: { created_at: 'DESC' },
        skip,
        take: limit,
      },
    );

    const patients = appointments.map((appointment) => ({
      id: appointment.patient.id,
      name: appointment.patient.name,
      email: appointment.patient.email,
      phone: '',
      age: '',
      gender: '',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
      status: appointment.active ? 'Active' : 'Inactive',
      medicalId: `MED${String(appointment.patient.id).padStart(3, '0')}`,
      lastVisit: appointment.created_at.toISOString().split('T')[0],
      appointmentId: appointment.id,
    }));

    return new ApiResponseDto(
      'Patients retrieved successfully',
      paginate(patients, total, page, limit),
    );
  }

  async getPatient(
    patientId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { patient_id: patientId, doctor_id: loginUser.id },
    });

    if (!appointment) {
      throw new HttpException(
        "You don't have access to this patient",
        HttpStatus.FORBIDDEN,
      );
    }

    const patientData = {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: '',
      age: '',
      gender: '',
      address: '',
      emergencyContact: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
      status: appointment.active ? 'Active' : 'Inactive',
      medicalId: `MED${String(patient.id).padStart(3, '0')}`,
      lastVisit: appointment.created_at.toISOString().split('T')[0],
      appointmentId: appointment.id,
    };

    return new ApiResponseDto('Patient retrieved successfully', patientData);
  }

  async updatePatient(
    patientId: number,
    patientData: PatientUpdateDto,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { patient_id: patientId, doctor_id: loginUser.id },
    });

    if (!appointment) {
      throw new HttpException(
        "You don't have access to this patient",
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      Object.assign(patient, patientData);
      await this.patientRepository.save(patient);

      return new ApiResponseDto('Patient updated successfully', {
        id: patient.id,
        name: patient.name,
        email: patient.email,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to update patient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePatient(
    patientId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new HttpException('Patient not found', HttpStatus.NOT_FOUND);
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { patient_id: patientId, doctor_id: loginUser.id },
    });

    if (!appointment) {
      throw new HttpException(
        "You don't have access to this patient",
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      appointment.active = false;
      await this.appointmentRepository.save(appointment);

      return new ApiResponseDto('Patient removed successfully', null);
    } catch (error) {
      throw new HttpException(
        'Failed to delete patient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async inactivePatient(
    patientId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new HttpException(
        `patient with id ${patientId} does not exist!`,
        HttpStatus.NOT_FOUND,
      );
    }

    const appointment = await this.appointmentRepository.findOne({
      where: { patient_id: patientId, doctor_id: loginUser.id },
    });

    if (!appointment) {
      throw new HttpException(
        "You don't have access to this patient",
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      appointment.active = false;
      await this.appointmentRepository.save(appointment);

      return new ApiResponseDto('Patient deactivated successfully', null);
    } catch (error) {
      throw new HttpException(
        'failed to inactive patient',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
