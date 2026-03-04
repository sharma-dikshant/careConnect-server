import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity('appointment_protocols')
export class AppointmentProtocol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appointment_id: number;

  @Column({ length: 255, nullable: true })
  file: string;

  @Column({ length: 512, nullable: true })
  s3_key: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(
    () => Appointment,
    (appointment) => appointment.appointment_protocols,
  )
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
