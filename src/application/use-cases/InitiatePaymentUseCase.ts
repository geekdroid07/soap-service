import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

import { ERROR_CODES } from '../constants/errorCodes';
import { buildSuccessResponse } from '../dto/responses';
import { ApplicationError } from '../errors/ApplicationError';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { PaymentSessionRepository } from '../../domain/repositories/PaymentSessionRepository';
import { TokenNotificationService } from '../../domain/services/TokenNotificationService';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const TOKEN_EXPIRATION = '1h'; // token válido por 1 hora

const generateToken = (payload: object = {}): string => {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRATION,
    algorithm: 'HS256',
  });
};

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
    const numericAmount = Number(amount);
    if (!document || !phone || amount === undefined) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'Documento, teléfono y monto son requeridos');
    }

    if (numericAmount <= 0) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'El monto debe ser mayor a cero');
    }

    const client = await this.clientRepository.findByDocumentAndPhone(document, phone);
    if (!client) {
      throw new ApplicationError(ERROR_CODES.NOT_FOUND, 'Cliente no encontrado');
    }

    if (client.balance < numericAmount) {
      throw new ApplicationError(ERROR_CODES.INSUFFICIENT_FUNDS, 'Saldo insuficiente');
    }

    const sessionId = randomUUID();
    const tokenPayload = { document, phone, amount: numericAmount, sessionId };
    const token = generateToken(tokenPayload);
    console.log('Generated token:', token);
    
    const session = this.paymentSessionRepository.create({
      sessionId,
      token,
      amount: numericAmount,
      client,
    });
    session.confirmed = false;

    await this.paymentSessionRepository.save(session);
    try {
      await this.tokenNotificationService.notifyPaymentToken(client.email, token);
    } catch (error) {
      console.error('Error sending payment token:', error);
    }

    return buildSuccessResponse(
      {
        sessionId,
        description: description ?? 'Compra pendiente de confirmación',
      },
      'Se envió un token de confirmación al correo registrado',
    );
  }
}
