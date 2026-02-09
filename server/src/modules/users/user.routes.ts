import { Router } from 'express';
import { requireAuthentication } from '@shared/middleware';
import { IUserController } from './user.controller.interface';

export const createUserRoutes = (userController: IUserController): Router => {
  const router = Router();

  /**
   * @openapi
   * /me:
   *   get:
   *     summary: Get current user profile
   *     description: Returns the authenticated user's profile information
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: User profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     userId:
   *                       type: string
   *                     sessionId:
   *                       type: string
   *                     role:
   *                       type: string
   *                       enum: [USER, STAFF, ADMIN]
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   */
  router.get('/me', requireAuthentication, (req, res) =>
    userController.getMe(req, res)
  );

  return router;
};
