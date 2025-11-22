import { ERROR_CODES } from '../constants/errorCodes';
import { buildErrorResponse, buildSuccessResponse } from '../dto/responses';
import { toClientDTO } from '../mappers/clientMapper';
import { ApplicationError } from '../errors/ApplicationError';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export type RegisterClientInput = {
  document: string;
  fullName: string;
  email: string;
  phone: string;
};

export class RegisterClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(input: RegisterClientInput) {
    const { document, fullName, email, phone } = input;

    if (!document || !fullName || !email || !phone) {
      throw new ApplicationError(ERROR_CODES.VALIDATION, 'Todos los campos son requeridos');
    }

    const existingDocument = await this.clientRepository.findByDocument(document);
    if (existingDocument) {
      throw new ApplicationError(ERROR_CODES.DUPLICATED, 'El documento ya se encuentra registrado');
    }

    const existingEmail = await this.clientRepository.findByEmail(email);
    if (existingEmail) {
      throw new ApplicationError(ERROR_CODES.DUPLICATED, 'El correo ya se encuentra registrado');
    }

    const client = this.clientRepository.create({ document, fullName, email, phone });
    const savedClient = await this.clientRepository.save(client);

    return buildSuccessResponse({ client: toClientDTO(savedClient) }, 'Cliente registrado correctamente');
  }
}
