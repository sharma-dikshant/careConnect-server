import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CareProtocol } from '../entities/care_protocol.entity';
import { AppointmentProtocol } from '../entities/appointment_protocol';
import { Appointment } from '../entities/appointment.entity';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { S3Service } from '../utils/s3.service';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_EXT = ['.pdf'];

@Injectable()
export class CareProtocolsService {
  constructor(
    @InjectRepository(CareProtocol)
    private careProtocolRepository: Repository<CareProtocol>,
    @InjectRepository(AppointmentProtocol)
    private appointmentProtocolRepository: Repository<AppointmentProtocol>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private s3Service: S3Service,
  ) {}

  async addCareProtocol(
    file: Express.Multer.File,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new HttpException(
        `File type ${ext} not allowed.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const filename = `${uuidv4()}_${file.originalname}`;
    const s3Key = `uploads/globals/${loginUser.id}/${filename}`;

    try {
      const s3Url = await this.s3Service.uploadFile(
        file.buffer,
        s3Key,
        file.mimetype,
      );

      const newGlobalContext = this.careProtocolRepository.create({
        doctor_id: loginUser.id,
        file: s3Url,
        s3_key: s3Key,
      });

      await this.careProtocolRepository.save(newGlobalContext);
      return new ApiResponseDto('success', { file: s3Url });
    } catch (error) {
      throw new HttpException(
        `Failed to add global context: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCareProtocolsByDoctorId(id: number) {
    try {
      const protocols = await this.careProtocolRepository.find({
        where: { doctor_id: id },
      });

      if (!protocols) {
        throw new HttpException(
          `No care protocols found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return new ApiResponseDto('success', protocols);
    } catch (error) {
      throw new HttpException(
        `Failed to found: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCareProtocolsByAppointmentId(id: number) {
    try {
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
        select: { id: true },
      });

      if (!appointment) {
        throw new HttpException(
          `no appointment found with id ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }

      const careProtocols = await this.appointmentProtocolRepository.find({
        where: { appointment_id: id },
      });

      if (!careProtocols) {
        throw new HttpException(
          `no care protocols found for appointment with id ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        `Failed to found care protocols for appointment: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAppointmentCareProtocols(
    appointmentId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    // Load appointment to resolve doctor_id / patient_id for authz
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new HttpException(
        `No appointment found with id: ${appointmentId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Only the appointment's doctor or patient may access these protocols
    const isDoctor =
      loginUser.role === 'doctor' && appointment.doctor_id === loginUser.id;
    const isPatient =
      loginUser.role === 'patient' && appointment.patient_id === loginUser.id;

    if (!isDoctor && !isPatient) {
      throw new HttpException(
        `You are not authorized to view protocols for this appointment`,
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      // Fetch appointment-scoped protocols and the doctor's global protocols in parallel
      const [appointmentProtocols, globalProtocols] = await Promise.all([
        this.appointmentProtocolRepository.find({
          where: { appointment_id: appointmentId, active: true },
          order: { created_at: 'ASC' },
        }),
        this.careProtocolRepository.find({
          where: { doctor_id: appointment.doctor_id, active: true },
          order: { created_at: 'ASC' },
        }),
      ]);

      return new ApiResponseDto('success', {
        appointment_id: appointmentId,
        appointment_protocols: appointmentProtocols,
        doctor_protocols: globalProtocols,
      });
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve care protocols: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addAppointmentCareProtocol(
    appointmentId: number,
    file: Express.Multer.File,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, doctor_id: loginUser.id },
    });

    if (!appointment) {
      throw new HttpException(
        `you're not allow to add context to appointment id: ${appointmentId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new HttpException(
        `file type ${ext} is not allowed`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const filename = `${uuidv4()}_${file.originalname}`;
    const s3Key = `uploads/appointments/${appointment.doctor_id}/${appointment.patient_id}/${filename}`;

    try {
      const s3Url = await this.s3Service.uploadFile(
        file.buffer,
        s3Key,
        file.mimetype,
      );

      const newLocalContext = this.appointmentProtocolRepository.create({
        appointment_id: appointmentId,
        file: s3Url,
        s3_key: s3Key,
      });

      await this.appointmentProtocolRepository.save(newLocalContext);
      return new ApiResponseDto('success', { file: s3Url });
    } catch (error) {
      throw new HttpException(
        `Failed to add patient context: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadCareProtocol(
    fileId: number,
    type: string,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    if (type === 'global') {
      // Only the owning doctor can download a global care protocol
      const protocol = await this.careProtocolRepository.findOne({
        where: { id: fileId },
      });

      if (!protocol) {
        throw new HttpException(
          `No care protocol found with id: ${fileId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (protocol.doctor_id !== loginUser.id) {
        throw new HttpException(
          `You are not authorized to download this care protocol`,
          HttpStatus.FORBIDDEN,
        );
      }

      if (!protocol.s3_key) {
        throw new HttpException(
          `S3 key not available for this care protocol`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      try {
        const presignedUrl = await this.s3Service.getPresignedUrl(
          protocol.s3_key,
        );
        return new ApiResponseDto('success', { url: presignedUrl });
      } catch (error) {
        throw new HttpException(
          `Failed to generate download URL: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else if (type === 'appointment') {
      // The appointment's doctor OR patient can download appointment protocols
      const protocol = await this.appointmentProtocolRepository.findOne({
        where: { id: fileId },
        relations: ['appointment'],
      });

      if (!protocol) {
        throw new HttpException(
          `No appointment care protocol found with id: ${fileId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      const { appointment } = protocol;
      const isDoctor =
        loginUser.role === 'doctor' && appointment.doctor_id === loginUser.id;
      const isPatient =
        loginUser.role === 'patient' &&
        appointment.patient_id === loginUser.id;

      if (!isDoctor && !isPatient) {
        throw new HttpException(
          `You are not authorized to download this care protocol`,
          HttpStatus.FORBIDDEN,
        );
      }

      if (!protocol.s3_key) {
        throw new HttpException(
          `S3 key not available for this care protocol`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      try {
        const presignedUrl = await this.s3Service.getPresignedUrl(
          protocol.s3_key,
        );
        return new ApiResponseDto('success', { url: presignedUrl });
      } catch (error) {
        throw new HttpException(
          `Failed to generate download URL: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      throw new HttpException(
        `Invalid type "${type}". Must be "global" or "appointment"`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async removeCareProtocol(
    contextId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const context = await this.careProtocolRepository.findOne({
      where: { id: contextId },
    });

    if (!context) {
      throw new HttpException(
        `no global context found with id: ${contextId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (context.doctor_id !== loginUser.id) {
      throw new HttpException(
        `global context ${contextId} doesn't belongs to you`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      context.active = false;
      await this.careProtocolRepository.save(context);
      return new ApiResponseDto('success', 'inactive global context');
    } catch (error) {
      throw new HttpException(
        `failed to remove global context ${contextId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeAppointmentCareProtocol(
    contextId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const context = await this.appointmentProtocolRepository.findOne({
      where: { id: contextId },
      relations: ['appointment'],
    });

    if (!context) {
      throw new HttpException(
        `no local context found with id: ${contextId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (context.appointment.doctor_id !== loginUser.id) {
      throw new HttpException(
        `local context ${contextId} doesn't belongs to you`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      context.active = false;
      await this.appointmentProtocolRepository.save(context);
      return new ApiResponseDto('success', 'inactive local context');
    } catch (error) {
      throw new HttpException(
        `failed to remove local context ${contextId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
