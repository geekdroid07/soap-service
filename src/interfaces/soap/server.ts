import { readFileSync } from 'fs';
import { join } from 'path';
import express from 'express';
import { createServer, Server } from 'http';
import * as soap from 'soap';

import { appConfig } from '../../config/env';
import { getSoapServiceDefinition } from './service';
import { logger } from '../../infrastructure/utils/logger';
import { type WalletUseCases } from '../../application/factories/createWalletUseCases';

type StartSoapServerOptions = {
  useCases?: WalletUseCases;
  port?: number;
  wsdl?: string;
};

export const startSoapServer = async (options: StartSoapServerOptions = {}) => {
  const app = express();
  const server = createServer(app);

  const service = await getSoapServiceDefinition(options.useCases);
  const wsdlString =
    options.wsdl ?? readFileSync(join(__dirname, '../../..', 'wallet.wsdl'), 'utf-8');

  soap.listen(server, '/wsdl', service, wsdlString);

  const requestedPort = options.port ?? appConfig.port;
  let effectivePort = requestedPort;

  await new Promise<void>((resolve) => {
    server.listen(requestedPort, () => {
      const address = server.address();
      if (typeof address === 'object' && address?.port) {
        effectivePort = address.port;
      }
      logger.info(`SOAP server running at http://localhost:${effectivePort}/wsdl?wsdl`);
      resolve();
    });
  });

  return { server: server as Server, port: effectivePort };
};
