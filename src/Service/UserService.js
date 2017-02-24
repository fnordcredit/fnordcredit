// @flow
import UserModel from '../Model/UserModel';
import winston from 'winston';

export function getAllUsers() {
  return UserModel.fetchAll({ columns: ['name', 'lastchanged', 'credit'] });
}

export async function addUser(username: string) {
  const existingUser = await UserModel.where({ name: username }).fetch();
  if (existingUser) {
    winston.error(`Couldn't save user ${username}, already exists`);
    throw new Error('User exists already.');
  }
  const user = await new UserModel({
    credit: 0,
    debtAllowed: true,
    lastchanged: new Date(),
    name: username,
  }).save({}, { method: 'insert' });
  winston.info(`[addUser] New user ${username} created`);

  return user;
}

export async function deleteUser(username: string) {
  await UserModel.where({
    name: username,
  }).destroy();
}
