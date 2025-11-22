import { DataSource, Repository } from 'typeorm';

import {
  CreatePaymentSessionParams,
  PaymentSessionRepository,
} from '../../../domain/repositories/PaymentSessionRepository';
import { PaymentSession } from '../../../domain/entities/PaymentSession';

export class TypeormPaymentSessionRepository implements PaymentSessionRepository {
  private repository: Repository<PaymentSession>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(PaymentSession);
  }

  create(params: CreatePaymentSessionParams): PaymentSession {
    return this.repository.create(params);
  }

  save(session: PaymentSession): Promise<PaymentSession> {
    return this.repository.save(session);
  }

  findBySessionId(sessionId: string): Promise<PaymentSession | null> {
    return this.repository.findOne({ where: { sessionId }, relations: ['client'] });
  }
}
