import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Message, SenderType } from '../entities/message.entity';
import { Appointment } from '../entities/appointment.entity';
import { MessageCreateDto } from '../dto/message.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import axios from 'axios';

@Injectable()
export class MessagesService {
  private ragServerBaseUrl: string;

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private configService: ConfigService,
  ) {
    this.ragServerBaseUrl = this.configService.getOrThrow<string>(
      'BOT_SERVER_BASE_URL',
    );
  }

  async sendBotMessage(
    body: MessageCreateDto,
    loginUser: AccessTokenPayloadDto,
    appointmentId: number,
  ): Promise<ApiResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, patient_id: loginUser.id },
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
      throw new HttpException(
        'failed to send message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new ApiResponseDto('success', { message: botResp });
  }
}
