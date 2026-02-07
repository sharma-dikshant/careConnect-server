import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('global_contexts')
export class GlobalContext {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctor_id: number;

  @Column({ length: 255, nullable: true })
  file: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Doctor, (doctor) => doctor.global_contexts)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
