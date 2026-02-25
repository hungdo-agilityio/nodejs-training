import { Router } from 'express';
import { requireAuthentication } from '@shared/middleware';
import { IUserController } from './user.controller.interface';

export const createUserRoutes = (userController: IUserController): Router => {
  const router = Router();

  /**
   * @openapi
   * /users/me:
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
   *                     id:
   *                       type: string
   *                       format: uuid
   *                     clerkUserId:
   *                       type: string
   *                     email:
   *                       type: string
   *                       format: email
   *                     firstName:
   *                       type: string
   *                     lastName:
   *                       type: string
   *                     phoneNumber:
   *                       type: string
   *                       nullable: true
   *                     role:
   *                       type: string
   *                       enum: [USER, STAFF, ADMIN]
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                     updatedAt:
   *                       type: string
   *                       format: date-time
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
