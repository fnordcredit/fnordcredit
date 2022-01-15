import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma.ts';

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     description: Create a new user
 *     tags:
 *     - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               dryRun:
 *                 type: boolean
 *                 default: false
 *                 description: 'If true, a user will not be created. However, it will still be checked whether the request is valid. For example if the user name does already exist, a request with dryRun will still return the same error.'
 *     responses:
 *       200:
 *         description: The user that has just been created or a dummy user if dryRun is true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       400:
 *         description: Bad request, for example if the required field "name" is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid request: Name missing"
 *       409:
 *         description: A HTTP 409 conflict will be given back if a user already exists with the given name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User already exists"
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    if (req.body.name == null) {
      res.status(400).json({ error: "Invalid request: Name missing" });
      return;
    }
    if (req.body.name.trim().length === 0) {
      res.status(409).json({ error: "User name cannot be empty" });
      return;
    };
    const oldUser = await prisma.user.findUnique({
      where: {
        name: req.body.name
      }
    });
    if (oldUser) {
      res.status(409).json({ error: "User already exists" });
      return;
    }
    if (req.body.dryRun) {
      res.status(200).json({
        id: 0,
        name: req.body.name,
        updatedAt: "1970-01-01T00:00:00.000Z",
        avatar: null
      });
      return;
    }
    const users = await prisma.user.create({
      data: {
        name: req.body.name
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        avatar: true
      }
    });
    res.status(200).json(users);
  } else {
    res.status(405);
  }
};

export default handler;
