import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { dbConfig } from '../../config/env';
import { Client } from '../../domain/entities/Client';
import { PaymentSession } from '../../domain/entities/PaymentSession';
import { WalletTransaction } from '../../domain/entities/WalletTransaction';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [Client, PaymentSession, WalletTransaction],
  synchronize: true,
  logging: false,
});

export const initializeDataSource = async (): Promise<DataSource> => {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  return AppDataSource.initialize();
};
