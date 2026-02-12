import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { ApiError } from '@shared/errors';

/**
 * Middleware that requires authentication
 * Returns 401 JSON response if no valid session is found (API-friendly, no redirects)
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);

  if (!auth.userId) {
    const error = ApiError.unauthorized('Authentication required');
    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  next();
};
