import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from '../entities/message.entity';
import { Appointment } from '../entities/appointment.entity';
import { DeviceToken } from '../entities/device_token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Appointment, DeviceToken]),
    ConfigModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
