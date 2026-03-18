import { Request, Response, NextFunction } from 'express';
import { ILogger } from '@shared/types';
import { ApiError } from '@shared/errors';

export const createErrorHandler = (logger: ILogger) => {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Error occurred:', err);

    if (err instanceof ApiError) {
      return res.status(err.statusCode).json(err.toJSON());
    }

    // Default error response for unexpected errors
    const defaultError = ApiError.internalError('An unexpected error occurred');
    res.status(defaultError.statusCode).json(defaultError.toJSON());
  };
};
