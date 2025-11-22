import { WalletTransaction } from '../entities/WalletTransaction';

export type CreateWalletTransactionParams = {
  type: WalletTransaction['type'];
  amount: number;
  description?: string;
  client: WalletTransaction['client'];
};

export interface WalletTransactionRepository {
  create(params: CreateWalletTransactionParams): WalletTransaction;
  save(transaction: WalletTransaction): Promise<WalletTransaction>;
}
