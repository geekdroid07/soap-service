import { ERROR_CODES } from '../constants/errorCodes';
import { buildSuccessResponse } from '../dto/responses';
import { ApplicationError } from '../errors/ApplicationError';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export type GetWalletBalanceInput = {
  document: string;
  phone: string;
};

export class GetWalletBalanceUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(input: GetWalletBalanceInput) {
    const { document, phone } = input;

    if (!document || !phone) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'Documento y teléfono son requeridos');
    }

    const client = await this.clientRepository.findByDocumentAndPhone(document, phone);
    if (!client) {
      throw new ApplicationError(ERROR_CODES.NOT_FOUND, 'Cliente no encontrado');
    }

    return buildSuccessResponse(
      {
        balance: client.balance,
      },
      'Consulta de saldo exitosa',
    );
  }
}
