import { Client } from '../../domain/entities/Client';
import { ClientDTO } from '../dto/client';

export const toClientDTO = (client: Client): ClientDTO => ({
  document: client.document,
  fullName: client.fullName,
  email: client.email,
  phone: client.phone,
  balance: client.balance,
});
