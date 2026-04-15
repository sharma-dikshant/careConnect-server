import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceToken } from '@entities/device_token.entity';
import { Appointment } from '@entities/appointment.entity';
import { Patient } from '@entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken, Appointment, Patient])],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
