import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Message, SenderType } from '../entities/message.entity';
import { Appointment } from '../entities/appointment.entity';
import { MessageCreateDto } from '../dto/message.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginationDto, paginate } from '../dto/pagination.dto';
import axios from 'axios';
import { DeviceToken } from '../entities/device_token.entity';

@Injectable()
export class MessagesService {
  private readonly ragServerBaseUrl: string;

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly configService: ConfigService,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
  ) {
    this.ragServerBaseUrl = this.configService.getOrThrow<string>(
      'BOT_SERVER_BASE_URL',
    );
  }

  async getMessages(
    appointmentId: number,
    loginUser: AccessTokenPayloadDto,
    pagination: PaginationDto,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new HttpException(
        `No appointment with id: ${appointmentId}`,
        HttpStatus.NOT_FOUND,
      );
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

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { appointment_id: appointmentId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return new ApiResponseDto(
      'Messages retrieved successfully',
      paginate(messages, total, page, limit),
    );
  }

  async sendBotMessage(
    body: MessageCreateDto,
    userId: number,
    appointmentId: number,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patient_id: userId },
    });

    if (!appointment) {
      throw new HttpException(
        `no appointment with id: ${appointmentId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const newMsg = this.messageRepository.create({
        appointment_id: appointmentId,
        sender: SenderType.PATIENT,
        message: body.message,
      });

      await this.messageRepository.save(newMsg);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let botResp: string;
    try {
      const result = await axios.post(`${this.ragServerBaseUrl}/query`, {
        query: body.message,
        patient_id: appointment.patient_id.toString(),
        doctor_id: appointment.doctor_id.toString(),
      });

      botResp = result.data.answer as string;
    } catch (error) {
      console.log(error);
      botResp = `Bot error: ${error.message}`;
    }

    try {
      const botMsg = this.messageRepository.create({
        appointment_id: appointmentId,
        sender: SenderType.BOT,
        message: botResp,
      });

      await this.messageRepository.save(botMsg);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new ApiResponseDto('success', { message: botResp });
  }

  async sendBotMessageByDevice(deviceToken: string, body: MessageCreateDto) {
    const device = await this.deviceTokenRepository.findOne({
      where: { token: deviceToken, active: true },
    });

    if (!device) {
      throw new NotFoundException('no device found with given details');
    }

    return this.sendBotMessage(body, device.patientId, device.appointmentId);
  }
}
