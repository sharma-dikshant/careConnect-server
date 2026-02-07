import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Appointment } from './appointment.entity';

export enum SenderType {
  PATIENT = 'patient',
  BOT = 'bot',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  appointment_id: number;

  @Column({
    type: 'enum',
    enum: SenderType,
  })
  sender: SenderType;

  @Column('text')
  message: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Appointment, (appointment) => appointment.messages)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;
}
