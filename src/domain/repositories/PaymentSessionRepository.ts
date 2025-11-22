import { PaymentSession } from '../entities/PaymentSession';

export type CreatePaymentSessionParams = {
  sessionId: string;
  token: string;
  amount: number;
  client: PaymentSession['client'];
};

export interface PaymentSessionRepository {
  create(params: CreatePaymentSessionParams): PaymentSession;
  save(session: PaymentSession): Promise<PaymentSession>;
  findBySessionId(sessionId: string): Promise<PaymentSession | null>;
}
