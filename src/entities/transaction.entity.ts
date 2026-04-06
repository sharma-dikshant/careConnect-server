import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ name: 'amount', type: 'int' })
  amount: number;

  @Column({ name: 'meta_info', type: 'jsonb' })
  metaInfo: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
