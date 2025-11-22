import { TokenNotificationService } from '../../domain/services/TokenNotificationService';
import { logger } from '../utils/logger';

export class LoggingTokenNotificationService implements TokenNotificationService {
  async notifyPaymentToken(email: string, token: string): Promise<void> {
    logger.info('Token de pago generado', { email, token });
  }
}
