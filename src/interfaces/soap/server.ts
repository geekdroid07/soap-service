import { readFileSync } from 'fs';
import { join } from 'path';
import express from 'express';
import { createServer } from 'http';
import * as soap from 'soap';

import { appConfig } from '../../config/env';
import { getSoapServiceDefinition } from './service';
import { logger } from '../../infrastructure/utils/logger';

export const startSoapServer = async () => {
  const app = express();
  const server = createServer(app);

  const service = await getSoapServiceDefinition();
  const wsdlPath = join(__dirname, '../../..', 'wallet.wsdl');
  const wsdl = readFileSync(wsdlPath, 'utf-8');

  soap.listen(server, '/wsdl', service, wsdl);

  return new Promise<void>((resolve) => {
    server.listen(appConfig.port, () => {
      logger.info(`SOAP server running at http://localhost:${appConfig.port}/wsdl?wsdl`);
      resolve();
    });
  });
};
