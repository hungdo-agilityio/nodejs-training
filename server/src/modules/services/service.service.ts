import { ILogger } from '@shared/types';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';
import { IServiceRepository } from './service.repository.interface';
import { IServiceService } from './service.service.interface';
import { Service } from './entities/service.entity';

export class ServiceService implements IServiceService {
  constructor(
    private serviceRepository: IServiceRepository,
    private logger: ILogger
  ) {}

  async getActiveServices(): Promise<Result<Service[], ApiError>> {
    try {
      const services = await this.serviceRepository.findAllActive();
      return Result.ok(services);
    } catch (error) {
      this.logger.error('Failed to get active services', error as Error);
      return Result.err(ApiError.internalError('Failed to retrieve services'));
    }
  }
}
