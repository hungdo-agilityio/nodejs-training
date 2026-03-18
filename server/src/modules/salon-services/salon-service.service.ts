import { ILogger } from '@shared/types';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';
import { ISalonServiceRepository } from './salon-service.repository.interface';
import { ISalonServiceService } from './salon-service.service.interface';
import { Service } from './entities/service.entity';

export class SalonServiceService implements ISalonServiceService {
  constructor(
    private serviceRepository: ISalonServiceRepository,
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
