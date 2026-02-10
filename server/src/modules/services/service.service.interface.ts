import { Result } from '@shared/utils';
import { Service } from './entities/service.entity';

export interface IServiceService {
  getActiveServices(): Promise<Result<Service[], string>>;
}
