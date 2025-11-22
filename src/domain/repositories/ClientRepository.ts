import { Client } from '../entities/Client';

export type CreateClientParams = {
  document: string;
  fullName: string;
  email: string;
  phone: string;
};

export interface ClientRepository {
  create(params: CreateClientParams): Client;
  save(client: Client): Promise<Client>;
  findByDocument(document: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findByDocumentAndPhone(document: string, phone: string): Promise<Client | null>;
}
