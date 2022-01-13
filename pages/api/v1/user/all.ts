import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma.ts';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *           description: Path to the users avatar
 *         updatedAt:
 *           type: string
 *           format: date-time
 * /api/v1/user/all:
 *   get:
 *     description: Returns all users
 *     tags:
 *     - User
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserPublic'
 */
const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      updatedAt: true,
      avatar: true
    }
  });
  res.status(200).json(users);
};

export default handler;
