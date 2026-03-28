import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Doctor } from './doctor.entity';

@Entity('balance')
export class Balance {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'credits' })
  credits: number;

  @OneToOne(() => Doctor, (doctor) => doctor.balance)
  @JoinColumn({ name: 'user_id' })
  doctor: Doctor;

  @Column({ name: 'expires_at', type: 'date' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
