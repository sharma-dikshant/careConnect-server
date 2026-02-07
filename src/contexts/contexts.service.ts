import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GlobalContext } from '../entities/global-context.entity';
import { LocalContext } from '../entities/local-context.entity';
import { Appointment } from '../entities/appointment.entity';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { S3Service } from '../utils/s3.service';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_EXT = ['.pdf'];

@Injectable()
export class ContextsService {
  constructor(
    @InjectRepository(GlobalContext)
    private globalContextRepository: Repository<GlobalContext>,
    @InjectRepository(LocalContext)
    private localContextRepository: Repository<LocalContext>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private s3Service: S3Service,
  ) {}

  async addGlobalContext(
    file: Express.Multer.File,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      throw new HttpException(`File type ${ext} not allowed.`, HttpStatus.BAD_REQUEST);
    }

    const filename = `${uuidv4()}_${file.originalname}`;
    const s3Key = `globals/${loginUser.id}/${filename}`;

    try {
      const s3Url = await this.s3Service.uploadFile(
        file.buffer,
        s3Key,
        file.mimetype,
      );

      const newGlobalContext = this.globalContextRepository.create({
        doctor_id: loginUser.id,
        file: s3Url,
      });

      await this.globalContextRepository.save(newGlobalContext);
      return new ApiResponseDto('success', { file: s3Url });
    } catch (error) {
      throw new HttpException(
        `Failed to add global context: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addPatientContext(
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
      throw new HttpException(`file type ${ext} is not allowed`, HttpStatus.BAD_REQUEST);
    }

    const filename = `${uuidv4()}_${file.originalname}`;
    const s3Key = `locals/${appointmentId}/${filename}`;

    try {
      const s3Url = await this.s3Service.uploadFile(
        file.buffer,
        s3Key,
        file.mimetype,
      );

      const newLocalContext = this.localContextRepository.create({
        appointment_id: appointmentId,
        file: s3Url,
      });

      await this.localContextRepository.save(newLocalContext);
      return new ApiResponseDto('success', { file: s3Url });
    } catch (error) {
      throw new HttpException(
        `Failed to add patient context: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeGlobalContext(
    contextId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const context = await this.globalContextRepository.findOne({ where: { id: contextId } });
    
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
      await this.globalContextRepository.save(context);
      return new ApiResponseDto('success', 'inactive global context');
    } catch (error) {
      throw new HttpException(
        `failed to remove global context ${contextId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeLocalContext(
    contextId: number,
    loginUser: AccessTokenPayloadDto,
  ): Promise<ApiResponseDto> {
    const context = await this.localContextRepository.findOne({
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
      await this.localContextRepository.save(context);
      return new ApiResponseDto('success', 'inactive local context');
    } catch (error) {
      throw new HttpException(
        `failed to remove local context ${contextId}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
