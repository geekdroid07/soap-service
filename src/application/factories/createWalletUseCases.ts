import { mailConfig } from '../../config/env';
import { RegisterClientUseCase } from '../use-cases/RegisterClientUseCase';
import { RechargeWalletUseCase } from '../use-cases/RechargeWalletUseCase';
import { InitiatePaymentUseCase } from '../use-cases/InitiatePaymentUseCase';
import { ConfirmPaymentUseCase } from '../use-cases/ConfirmPaymentUseCase';
import { GetWalletBalanceUseCase } from '../use-cases/GetWalletBalanceUseCase';
import { initializeDataSource } from '../../infrastructure/database/data-source';
import { TypeormClientRepository } from '../../infrastructure/repositories/typeorm/TypeormClientRepository';
import { TypeormWalletTransactionRepository } from '../../infrastructure/repositories/typeorm/TypeormWalletTransactionRepository';
import { TypeormPaymentSessionRepository } from '../../infrastructure/repositories/typeorm/TypeormPaymentSessionRepository';
import { EmailTokenNotificationService } from '../../infrastructure/services/EmailTokenNotificationService';
import { LoggingTokenNotificationService } from '../../infrastructure/services/LoggingTokenNotificationService';
import { TokenNotificationService } from '../../domain/services/TokenNotificationService';
import { logger } from '../../infrastructure/utils/logger';

export type WalletUseCases = {
  registerClient: RegisterClientUseCase;
  rechargeWallet: RechargeWalletUseCase;
  initiatePayment: InitiatePaymentUseCase;
  confirmPayment: ConfirmPaymentUseCase;
  getWalletBalance: GetWalletBalanceUseCase;
};

const buildTokenNotificationService = (): TokenNotificationService => {
  if (mailConfig.host && mailConfig.user && mailConfig.pass && mailConfig.from) {
    logger.info('Inicializando servicio de correo para envío de tokens');
    return new EmailTokenNotificationService({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
      from: mailConfig.from,
    });
  }

  logger.warn('Configuración de correo incompleta, usando notificador con logging');
  return new LoggingTokenNotificationService();
};

export const createWalletUseCases = async (): Promise<WalletUseCases> => {
  const dataSource = await initializeDataSource();

  const clientRepository = new TypeormClientRepository(dataSource);
  const walletTransactionRepository = new TypeormWalletTransactionRepository(dataSource);
  const paymentSessionRepository = new TypeormPaymentSessionRepository(dataSource);
  const tokenNotificationService = buildTokenNotificationService();

  return {
    registerClient: new RegisterClientUseCase(clientRepository),
    rechargeWallet: new RechargeWalletUseCase(
      clientRepository,
      walletTransactionRepository,
    ),
    initiatePayment: new InitiatePaymentUseCase(
      clientRepository,
      paymentSessionRepository,
      tokenNotificationService,
    ),
    confirmPayment: new ConfirmPaymentUseCase(
      paymentSessionRepository,
      walletTransactionRepository,
      clientRepository,
    ),
    getWalletBalance: new GetWalletBalanceUseCase(clientRepository),
  };
};
