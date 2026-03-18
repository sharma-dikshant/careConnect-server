import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Message } from '../entities/message.entity';
import {
  AppointmentCreateDto,
  AppointmentUpdateDto,
} from '../dto/appointment.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginationDto, paginate } from '../dto/pagination.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createAppointment(
    data: AppointmentCreateDto,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    // Verify user is a doctor
    if (loginUser.role !== 'doctor') {
      throw new HttpException(
        'Only doctors can create appointments',
        HttpStatus.FORBIDDEN,
      );
    }

    // Find patient by email
    const patient = await this.patientRepository.findOne({
      where: { email: data.patientEmail },
    });

    if (!patient) {
      throw new HttpException(
        'Patient not found with this email',
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const appointment = this.appointmentRepository.create({
        patient,
        doctor: { id: loginUser.id } as Doctor,
        title: data.title,
        description: data.description,
      });

      await this.appointmentRepository.save(appointment);

      return new ApiResponseDto('Appointment created successfully', {
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        patient: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
        },
        created_at: appointment.created_at,
      });
    } catch (error) {
      throw new HttpException(
        'Failed to create appointment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAppointment(
    appointmentId: number,
    data: AppointmentUpdateDto,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    if (appointment.doctor_id !== loginUser.id) {
      throw new HttpException(
        'You are not the doctor for this appointment',
        HttpStatus.FORBIDDEN,
      );
    }

    Object.assign(appointment, data);
    const updated = await this.appointmentRepository.save(appointment);

    return new ApiResponseDto('Appointment updated successfully', {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
        email: appointment.patient.email,
      },
      created_at: updated.created_at,
    });
  }

  async deleteAppointment(
    appointmentId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    if (appointment.doctor_id !== loginUser.id) {
      throw new HttpException(
        'You are not the doctor for this appointment',
        HttpStatus.FORBIDDEN,
      );
    }

    appointment.active = false;
    await this.appointmentRepository.save(appointment);

    return new ApiResponseDto('Appointment deleted successfully');
  }

  async getAppointments(
    loginUser: AccessTokenPayloadDto,
    pagination: PaginationDto,
  ): Promise<ApiResponseDto> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    try {
      if (loginUser.role === 'doctor') {
        const [appointments, total] =
          await this.appointmentRepository.findAndCount({
            where: { doctor_id: loginUser.id, active: true },
            relations: ['patient'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
          });

        const items = appointments.map((apt) => ({
          id: apt.id,
          title: apt.title,
          description: apt.description,
          patient: {
            id: apt.patient.id,
            name: apt.patient.name,
            email: apt.patient.email,
          },
          created_at: apt.created_at,
        }));

        return new ApiResponseDto(
          'Appointments retrieved successfully',
          paginate(items, total, page, limit),
        );
      } else {
        const [appointments, total] =
          await this.appointmentRepository.findAndCount({
            where: { patient_id: loginUser.id, active: true },
            relations: ['doctor'],
            order: { created_at: 'DESC' },
            skip,
            take: limit,
          });

        const items = appointments.map((apt) => ({
          id: apt.id,
          title: apt.title,
          description: apt.description,
          doctor: {
            id: apt.doctor.id,
            name: apt.doctor.name,
            email: apt.doctor.email,
            specialization: apt.doctor.specialization,
          },
          created_at: apt.created_at,
        }));

        return new ApiResponseDto(
          'Appointments retrieved successfully',
          paginate(items, total, page, limit),
        );
      }
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve appointments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAppointmentMessages(
    appointmentId: number,
    loginUser: AccessTokenPayloadDto,
    pagination: PaginationDto,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient', 'doctor'],
    });

    if (!appointment) {
      throw new HttpException('Appointment not found', HttpStatus.NOT_FOUND);
    }

    const isDoctor =
      loginUser.role === 'doctor' && appointment.doctor_id === loginUser.id;
    const isPatient =
      loginUser.role === 'patient' && appointment.patient_id === loginUser.id;

    if (!isDoctor && !isPatient) {
      throw new HttpException(
        'You do not have access to this appointment',
        HttpStatus.FORBIDDEN,
      );
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    try {
      const [messages, total] = await this.messageRepository.findAndCount({
        where: { appointment_id: appointmentId },
        order: { created_at: 'ASC' },
        skip,
        take: limit,
      });

      return new ApiResponseDto(
        'Messages retrieved successfully',
        paginate(messages, total, page, limit),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve messages',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
