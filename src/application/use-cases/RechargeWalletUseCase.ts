import { ERROR_CODES } from '../constants/errorCodes';
import { buildSuccessResponse } from '../dto/responses';
import { ApplicationError } from '../errors/ApplicationError';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { WalletTransactionRepository } from '../../domain/repositories/WalletTransactionRepository';

export type RechargeWalletInput = {
  document: string;
  phone: string;
  amount: number;
};

export class RechargeWalletUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly walletTransactionRepository: WalletTransactionRepository,
  ) {}

  async execute(input: RechargeWalletInput) {
    const { document, phone, amount } = input;

    if (!document || !phone || amount === undefined) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'Documento, teléfono y monto son requeridos');
    }

    if (amount <= 0) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'El monto debe ser mayor a cero');
    }

    const client = await this.clientRepository.findByDocumentAndPhone(document, phone);
    if (!client) {
      throw new ApplicationError(ERROR_CODES.NOT_FOUND, 'Cliente no encontrado');
    }

    client.balance += Number(amount);
    const transaction = this.walletTransactionRepository.create({
      type: 'RECHARGE',
      amount,
      description: 'Recarga de billetera',
      client,
    });

    await Promise.all([
      this.clientRepository.save(client),
      this.walletTransactionRepository.save(transaction),
    ]);

    return buildSuccessResponse(
      {
        newBalance: client.balance,
      },
      'Recarga realizada correctamente',
    );
  }
}
