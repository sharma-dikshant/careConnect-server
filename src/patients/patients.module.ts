import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';

import { Patient } from '../entities/patient.entity';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, Appointment, Doctor])],
  controllers: [],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
