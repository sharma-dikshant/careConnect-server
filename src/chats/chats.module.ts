import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { Message } from '../entities/message.entity';
import { Appointment } from '../entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Appointment]), ConfigModule],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
