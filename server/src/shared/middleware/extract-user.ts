import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

export interface AuthenticatedUser {
  userId: string;
  sessionId: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

/**
 * Middleware that extracts user info from Clerk session
 * Use after requireAuthentication middleware
 */
export const extractUser = (req: Request, _res: Response, next: NextFunction): void => {
  const auth = getAuth(req);

  if (auth.userId) {
    (req as AuthenticatedRequest).user = {
      userId: auth.userId,
      sessionId: auth.sessionId ?? '',
    };
  }

  next();
};
