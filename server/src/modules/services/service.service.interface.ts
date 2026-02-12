import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';
import { Service } from './entities/service.entity';

export interface IServiceService {
  getActiveServices(): Promise<Result<Service[], ApiError>>;
}
