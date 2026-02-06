import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { AppError } from './error-handler';

/**
 * Role-based authorization middleware factory
 * Use after requireAuthentication middleware
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const auth = getAuth(req);

    if (!auth.userId) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const sessionClaims = auth.sessionClaims;
    const userRole = (sessionClaims?.metadata as { role?: string })?.role ?? 'USER';

    if (!allowedRoles.includes(userRole)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
    }

    next();
  };
};
