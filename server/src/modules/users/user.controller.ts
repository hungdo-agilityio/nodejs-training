import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { IUserController } from './user.controller.interface';

export class UserController implements IUserController {
  async getMe(req: Request, res: Response): Promise<void> {
    const auth = getAuth(req);

    // User is already loaded by loadUser middleware
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.json({
      data: {
        userId: auth.userId,
        sessionId: auth.sessionId,
        role: req.user.role,
      },
    });
  }
}
