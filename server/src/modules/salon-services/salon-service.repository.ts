import { Repository, In } from 'typeorm';
import { AppDataSource } from '@shared/database';
import { Service } from './entities/service.entity';
import { ISalonServiceRepository } from './salon-service.repository.interface';

export class SalonServiceRepository implements ISalonServiceRepository {
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

  async findActiveByIds(ids: string[]): Promise<Service[]> {
    return this.repository.find({
      where: {
        id: In(ids),
        isActive: true,
      },
    });
  }
}
