import { ERROR_CODES } from '../constants/errorCodes';
import { buildSuccessResponse } from '../dto/responses';
import { ApplicationError } from '../errors/ApplicationError';
import { PaymentSessionRepository } from '../../domain/repositories/PaymentSessionRepository';
import { WalletTransactionRepository } from '../../domain/repositories/WalletTransactionRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export type ConfirmPaymentInput = {
  sessionId: string;
  token: string;
};

export class ConfirmPaymentUseCase {
  constructor(
    private readonly paymentSessionRepository: PaymentSessionRepository,
    private readonly walletTransactionRepository: WalletTransactionRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: ConfirmPaymentInput) {
    const { sessionId, token } = input;

    if (!sessionId || !token) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'El id de sesión y token son requeridos');
    }

    const session = await this.paymentSessionRepository.findBySessionId(sessionId);

    if (!session) {
      throw new ApplicationError(ERROR_CODES.NOT_FOUND, 'Sesión de pago no encontrada');
    }

    if (session.confirmed) {
      throw new ApplicationError(ERROR_CODES.SESSION_EXPIRED, 'La sesión ya fue confirmada');
    }

    if (session.token !== token) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token inválido');
    }

    const client = session.client;

    if (!client) {
      throw new ApplicationError(ERROR_CODES.INTERNAL, 'Sesión sin cliente asociado');
    }

    if (client.balance < session.amount) {
      throw new ApplicationError(ERROR_CODES.INSUFFICIENT_FUNDS, 'Saldo insuficiente');
    }

    client.balance -= session.amount;
    session.confirmed = true;

    const transaction = this.walletTransactionRepository.create({
      type: 'PAYMENT',
      amount: session.amount,
      description: `Pago confirmado para sesión ${session.sessionId}`,
      client,
    });

    await Promise.all([
      this.clientRepository.save(client),
      this.paymentSessionRepository.save(session),
      this.walletTransactionRepository.save(transaction),
    ]);

    return buildSuccessResponse(
      {
        sessionId: session.sessionId,
        newBalance: client.balance,
      },
      'Pago confirmado correctamente',
    );
  }
}
