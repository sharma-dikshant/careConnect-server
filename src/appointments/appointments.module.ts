import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Message } from '../entities/message.entity';
import { OtpService } from 'src/otp/otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient, Message])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, OtpService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
