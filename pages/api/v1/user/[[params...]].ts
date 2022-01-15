import { NextApiRequest, NextApiResponse } from 'next';
import { createHandler, ValidationPipe, Body, Get, HttpCode, NotFoundException, Post, Query, ParseBooleanPipe } from '@storyofams/next-api-decorators';
import prisma from '../../../../lib/prisma.ts';
import {
  IsNotEmpty, IsInt, IsString, IsOptional, IsDateString,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

const validationOpts = { whitelist: true, forbidNonWhitelisted: true };

@ValidatorConstraint({ async: true })
export class IsUniqueUserConstraint implements ValidatorConstraintInterface {
  validate(userName: any, args: ValidationArguments) {
    return prisma.user.findUnique({
      where: {
        name: userName
      }
    }).then(user => {
      if (user) return false;
      return true;
    });
  }
}

export function IsUniqueUser(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueUserConstraint,
    });
  };
}

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicUser:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - updatedAt
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
 */
export class PublicUserDTO {
  @IsInt()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsDateString()
  updatedAt: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUser:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         avatar:
 *           type: string
 *           description: Path to the users avatar
 */
export class CreateUserDTO {
  @IsNotEmpty({ message: "User name cannot be empty" })
  @IsString()
  @IsUniqueUser({ message: "User already exists" })
  name: string;

  @IsOptional()
  @IsString()
  avatar: string;
}

class UserHandler {
/**
 * @swagger
 * /api/v1/user:
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
 *                 $ref: '#/components/schemas/PublicUser'
 */
  @Get()
  async listUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true,
        avatar: true
      }
    });
  }

/**
 * @swagger
 * /api/v1/user:
 *   post:
 *     description: Create a new user
 *     tags:
 *     - User
 *     parameters:
 *       - in: query
 *         name: dryRun
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *           example: true
 *           description: 'If true, a user will not be created. However, it will still be checked whether the request is valid. For example if the user name does already exist, a request with dryRun will still return the same error.'
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
 *                 example: "silsha"
 *               avatar:
 *                 type: string
 *                 example: "/ava.png"
 *     responses:
 *       200:
 *         description: The user that has just been created or a dummy user if dryRun is true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *       400:
 *         description: Bad request, for example if the required field "name" is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 */
  @Post()
  async createUser(@Body(ValidationPipe(validationOpts)) body: CreateUserDTO,
    @Query('dryRun', ParseBooleanPipe) dryRun: boolean) {
    if (!dryRun) {
      return await prisma.user.create({
        data: body,
        select: {
          id: true,
          name: true,
          updatedAt: true,
          avatar: true
        }
      });
    }
  }
}

export default createHandler(UserHandler);
