import { describe, expect, it, jest } from '@jest/globals';

import { RegisterClientUseCase } from '../../src/application/use-cases/RegisterClientUseCase';
import { ApplicationError } from '../../src/application/errors/ApplicationError';
import type { ClientRepository } from '../../src/domain/repositories/ClientRepository';
import type { Client } from '../../src/domain/entities/Client';

const buildRepository = () => {
  const repository: jest.Mocked<ClientRepository> = {
    create: jest.fn(),
    save: jest.fn(),
    findByDocument: jest.fn(),
    findByEmail: jest.fn(),
    findByDocumentAndPhone: jest.fn(),
  };

  return repository;
};

describe('RegisterClientUseCase', () => {
  const validInput = {
    document: '123456789',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '5551234',
  };

  it('registers a new client successfully', async () => {
    const repository = buildRepository();
    const useCase = new RegisterClientUseCase(repository);
    const savedClient = { ...validInput, id: 'client-1', balance: 0 } as Client;

    repository.findByDocument.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockReturnValue(savedClient);
    repository.save.mockResolvedValue(savedClient);

    const result = await useCase.execute(validInput);

    expect(result.success).toBe(true);
    expect(repository.create).toHaveBeenCalledWith(validInput);
    expect(repository.save).toHaveBeenCalledWith(savedClient);
  });

  it('throws validation error when fields are missing', async () => {
    const repository = buildRepository();
    const useCase = new RegisterClientUseCase(repository);

    await expect(useCase.execute({ ...validInput, document: '' })).rejects.toBeInstanceOf(ApplicationError);
  });

  it('prevents duplicate document registration', async () => {
    const repository = buildRepository();
    const useCase = new RegisterClientUseCase(repository);

    repository.findByDocument.mockResolvedValue({} as Client);

    await expect(useCase.execute(validInput)).rejects.toMatchObject({ code: '02' });
    expect(repository.findByEmail).not.toHaveBeenCalled();
  });

  it('prevents duplicate email registration', async () => {
    const repository = buildRepository();
    const useCase = new RegisterClientUseCase(repository);

    repository.findByDocument.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue({} as Client);

    await expect(useCase.execute(validInput)).rejects.toMatchObject({ code: '02' });
  });
});
