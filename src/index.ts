import { startSoapServer } from './interfaces/soap/server';
import { logger } from './infrastructure/utils/logger';

startSoapServer().catch((error) => {
  logger.error('Error al iniciar el servicio SOAP', error);
  process.exit(1);
});
