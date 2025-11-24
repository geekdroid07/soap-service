import { ERROR_CODES } from '../constants/errorCodes';
import { buildSuccessResponse } from '../dto/responses';
import { ApplicationError } from '../errors/ApplicationError';
import { PaymentSessionRepository } from '../../domain/repositories/PaymentSessionRepository';
import { WalletTransactionRepository } from '../../domain/repositories/WalletTransactionRepository';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import jwt from 'jsonwebtoken';

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
    // Verify JWT signature and decode payload
    const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch (err) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token inválido o expirado');
    }
    // Ensure the provided token matches the stored session token
    if (session.token !== token) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token inválido');
    }

    // Optional: validate payload fields against session/client
    const client = session.client;
    if (!client) {
      throw new ApplicationError(ERROR_CODES.INTERNAL, 'Sesión sin cliente asociado');
    }

    if (payload.document && payload.document !== client.document) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token no corresponde al cliente');
    }

    if (payload.phone && payload.phone !== client.phone) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token no corresponde al cliente');
    }

    if (payload.amount && Number(payload.amount) !== Number(session.amount)) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token no corresponde al monto de la sesión');
    }

    if (payload.sessionId && payload.sessionId !== session.sessionId) {
      throw new ApplicationError(ERROR_CODES.TOKEN_INVALID, 'Token no corresponde a la sesión');
    }

    // client already obtained and validated above

    if (client.balance < Number(session.amount)) {
      throw new ApplicationError(ERROR_CODES.INSUFFICIENT_FUNDS, 'Saldo insuficiente');
    }

    client.balance -= Number(session.amount);
    session.confirmed = true;

    const transaction = this.walletTransactionRepository.create({
      type: 'PAYMENT',
      amount: Number(session.amount),
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
