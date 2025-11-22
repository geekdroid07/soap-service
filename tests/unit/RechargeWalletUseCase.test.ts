import { describe, expect, it, jest } from '@jest/globals';
import type { MockedFunction } from 'jest-mock';

import { RechargeWalletUseCase } from '../../src/application/use-cases/RechargeWalletUseCase';
import { ApplicationError } from '../../src/application/errors/ApplicationError';
import type { ClientRepository } from '../../src/domain/repositories/ClientRepository';
import type { WalletTransactionRepository } from '../../src/domain/repositories/WalletTransactionRepository';
import type { Client } from '../../src/domain/entities/Client';

const createClientRepository = (): jest.Mocked<ClientRepository> => ({
  create: jest.fn() as MockedFunction<ClientRepository['create']>,
  save: jest.fn() as MockedFunction<ClientRepository['save']>,
  findByDocument: jest.fn() as MockedFunction<ClientRepository['findByDocument']>,
  findByEmail: jest.fn() as MockedFunction<ClientRepository['findByEmail']>,
  findByDocumentAndPhone: jest.fn() as MockedFunction<ClientRepository['findByDocumentAndPhone']>,
});

const createTransactionRepository = (): jest.Mocked<WalletTransactionRepository> => ({
  create: jest.fn() as MockedFunction<WalletTransactionRepository['create']>,
  save: jest.fn() as MockedFunction<WalletTransactionRepository['save']>,
});

describe('RechargeWalletUseCase', () => {
  const input = { document: '123456789', phone: '5551234', amount: 150 };

  it('increments client balance and records transaction', async () => {
    const clientRepository = createClientRepository();
    const transactionRepository = createTransactionRepository();
    const useCase = new RechargeWalletUseCase(clientRepository, transactionRepository);

    const client = { balance: 100 } as Client;
    const transaction = { id: 'transaction-1' } as any;

    clientRepository.findByDocumentAndPhone.mockResolvedValue(client);
    transactionRepository.create.mockReturnValue(transaction);

    const response = await useCase.execute(input);

    expect(response.success).toBe(true);
    expect(client.balance).toBe(250);
    expect(clientRepository.save).toHaveBeenCalledWith(client);
    expect(transactionRepository.save).toHaveBeenCalledWith(transaction);
  });

  it('throws validation error when amount is not positive', async () => {
    const useCase = new RechargeWalletUseCase(createClientRepository(), createTransactionRepository());

    await expect(useCase.execute({ ...input, amount: 0 })).rejects.toBeInstanceOf(ApplicationError);
  });

  it('throws not found error when client is missing', async () => {
    const clientRepository = createClientRepository();
    const useCase = new RechargeWalletUseCase(clientRepository, createTransactionRepository());

    clientRepository.findByDocumentAndPhone.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toMatchObject({ code: '03' });
  });
});
