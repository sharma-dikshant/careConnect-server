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
    const s3Key = `uploads/locals/${appointmentId}/${filename}`;

    try {
      const s3Url = await this.s3Service.uploadFile(
        file.buffer,
        s3Key,
        file.mimetype,
      );

      const newLocalContext = this.appointmentProtocolRepository.create({
        appointment_id: appointmentId,
        file: s3Url,
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
