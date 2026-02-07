import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareProtocolsService } from './care_protocols.service';
import { CareProtocolsController } from './care_protocols.controller';
import { CareProtocol } from '../entities/care_protocol.entity';
import { AppointmentProtocol } from '../entities/appointment_protocol';
import { Appointment } from '../entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CareProtocol, AppointmentProtocol, Appointment]),
  ],
  controllers: [CareProtocolsController],
  providers: [CareProtocolsService],
})
export class CareProtocolsModule {}
