import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'token', type: 'varchar' })
  token: string;

  @Column({ name: 'amount', type: 'int' })
  patientId: number;

  @Column({ name: 'apointment_id', type: 'int' })
  appointmentId: number;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
