import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Appointment } from './appointment.entity';
import { GlobalContext } from './global-context.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 10, unique: true })
  phone: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ length: 255, nullable: true })
  designation: string;

  @Column({ length: 255, nullable: true })
  license: string;

  @Column({ length: 255, nullable: true })
  specialization: string;

  @Column({ default: 0 })
  experience: number;

  @Column('text', { nullable: true })
  bio: string;

  @Column({ length: 255, nullable: true })
  hospital: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => GlobalContext, (globalContext) => globalContext.doctor)
  global_contexts: GlobalContext[];
}
