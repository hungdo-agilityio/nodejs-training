import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

/**
 * Middleware that requires authentication
 * Returns 401 JSON response if no valid session is found (API-friendly, no redirects)
 */
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  next();
};
