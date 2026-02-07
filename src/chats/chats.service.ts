import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Message, SenderType } from '../entities/message.entity';
import { Appointment } from '../entities/appointment.entity';
import { MessageCreateDto } from '../dto/message.dto';
import { AccessTokenPayloadDto } from '../dto/auth.dto';
import { ApiResponseDto } from '../dto/api-response.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ChatsService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get('GOOGLE_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
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
        sender: body.sender as SenderType,
        message: body.message,
      });

      await this.messageRepository.save(newMsg);
    } catch (error) {
      throw new HttpException('failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    let botResp: string;
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
      const result = await model.generateContent(body.message);
      const response = await result.response;
      botResp = response.text();
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
      throw new HttpException('failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return new ApiResponseDto('success', { message: botResp });
  }
}
