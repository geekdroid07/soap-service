import { randomUUID } from 'crypto';

import { ERROR_CODES } from '../constants/errorCodes';
import { buildSuccessResponse } from '../dto/responses';
import { ApplicationError } from '../errors/ApplicationError';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { PaymentSessionRepository } from '../../domain/repositories/PaymentSessionRepository';
import { TokenNotificationService } from '../../domain/services/TokenNotificationService';

const generateToken = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export type InitiatePaymentInput = {
  document: string;
  phone: string;
  amount: number;
  description?: string;
};

export class InitiatePaymentUseCase {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly paymentSessionRepository: PaymentSessionRepository,
    private readonly tokenNotificationService: TokenNotificationService,
  ) {}

  async execute(input: InitiatePaymentInput) {
    const { document, phone, amount, description } = input;

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

    if (client.balance < amount) {
      throw new ApplicationError(ERROR_CODES.INSUFFICIENT_FUNDS, 'Saldo insuficiente');
    }

    const token = generateToken();
    const sessionId = randomUUID();

    const session = this.paymentSessionRepository.create({
      sessionId,
      token,
      amount,
      client,
    });
    session.confirmed = false;

    await this.paymentSessionRepository.save(session);
    await this.tokenNotificationService.notifyPaymentToken(client.email, token);

    return buildSuccessResponse(
      {
        sessionId,
        description: description ?? 'Compra pendiente de confirmación',
      },
      'Se envió un token de confirmación al correo registrado',
    );
  }
}
