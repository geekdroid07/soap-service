import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Client } from './Client';

export type WalletTransactionType = 'RECHARGE' | 'PAYMENT';

const numericTransformer = {
  to: (value: number): number => value,
  from: (value: string | null): number => (value ? Number(value) : 0),
};

@Entity({ name: 'wallet_transactions' })
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ['RECHARGE', 'PAYMENT'] })
  type!: WalletTransactionType;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  amount!: number;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(
    () => Client,
    (client: Client) => client.transactions,
    {
    onDelete: 'CASCADE',
  })
  client!: Client;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
