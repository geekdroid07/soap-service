import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Client } from './Client';

const numericTransformer = {
  to: (value: number): number => value,
  from: (value: string | null): number => (value ? Number(value) : 0),
};

@Entity({ name: 'payment_sessions' })
export class PaymentSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', unique: true })
  sessionId!: string;

  @Column({ name: 'token', length: 6 })
  token!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount!: number;

  @Column({ default: false })
  confirmed!: boolean;

  @ManyToOne(
    () => Client,
    (client: Client) => client.paymentSessions,
    {
    onDelete: 'CASCADE',
  })
  client!: Client;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
