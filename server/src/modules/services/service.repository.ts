import { Repository } from 'typeorm';
import { AppDataSource } from '@shared/database';
import { Service } from './entities/service.entity';
import { IServiceRepository } from './service.repository.interface';

export class ServiceRepository implements IServiceRepository {
  private repository: Repository<Service>;

  constructor() {
    this.repository = AppDataSource.getRepository(Service);
  }

  async findAllActive(): Promise<Service[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return this.repository.findOneBy({ id });
  }
}
