import { DataSource, Repository } from 'typeorm';

import {
  ClientRepository,
  CreateClientParams,
} from '../../../domain/repositories/ClientRepository';
import { Client } from '../../../domain/entities/Client';

export class TypeormClientRepository implements ClientRepository {
  private repository: Repository<Client>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Client);
  }

  create(params: CreateClientParams): Client {
    return this.repository.create(params);
  }

  save(client: Client): Promise<Client> {
    return this.repository.save(client);
  }

  findByDocument(document: string): Promise<Client | null> {
    return this.repository.findOne({ where: { document } });
  }

  findByEmail(email: string): Promise<Client | null> {
    return this.repository.findOne({ where: { email } });
  }

  findByDocumentAndPhone(document: string, phone: string): Promise<Client | null> {
    return this.repository.findOne({ where: { document, phone } });
  }
}
