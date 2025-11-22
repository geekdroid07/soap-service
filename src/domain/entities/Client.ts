import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PaymentSession } from './PaymentSession';
import { WalletTransaction } from './WalletTransaction';

const numericTransformer = {
  to: (value: number): number => value,
  from: (value: string | null): number => (value ? Number(value) : 0),
};

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  document!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  balance!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(
    () => WalletTransaction,
    (transaction: WalletTransaction) => transaction.client,
  )
  transactions!: WalletTransaction[];

  @OneToMany(
    () => PaymentSession,
    (session: PaymentSession) => session.client,
  )
  paymentSessions!: PaymentSession[];
}
