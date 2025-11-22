import { DataSource, Repository } from 'typeorm';

import {
  CreateWalletTransactionParams,
  WalletTransactionRepository,
} from '../../../domain/repositories/WalletTransactionRepository';
import { WalletTransaction } from '../../../domain/entities/WalletTransaction';

export class TypeormWalletTransactionRepository
  implements WalletTransactionRepository
{
  private repository: Repository<WalletTransaction>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(WalletTransaction);
  }

  create(params: CreateWalletTransactionParams): WalletTransaction {
    return this.repository.create(params);
  }

  save(transaction: WalletTransaction): Promise<WalletTransaction> {
    return this.repository.save(transaction);
  }
}
