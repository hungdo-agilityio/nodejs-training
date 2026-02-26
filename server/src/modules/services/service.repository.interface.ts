import { Service } from './entities/service.entity';

export interface IServiceRepository {
  findAllActive(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  findActiveByIds(ids: string[]): Promise<Service[]>;
}
