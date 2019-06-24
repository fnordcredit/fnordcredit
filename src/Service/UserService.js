// @flow
import passwordHash from 'password-hash';
import TransactionModel from '../Model/TransactionModel';
import UserModel from '../Model/UserModel';
import Logger from 'Logger';

export async function deleteUser(userId: number, force: boolean = false) {
  const user = await getUser(userId);
  if (!force && user.get('credit') !== 0) {
    throw new Error('Cannot delete User unless 0 credit');
  }
  await user.destroy();
}

export async function updateToken(userId: number, newToken: string): Promise<UserModel> {
  const user = await UserModel.where({
    id: userId,
  }).fetch();
  if (user) {
    return user.save({
      token: newToken,
    });
  }
  throw new Error('User not Found');
}

export function getAllUsers() {
  return UserModel.fetchAll({
    columns: ['id', 'name', 'lastchanged', 'credit'],
  });
}

export async function userHasPin(userId: number) {
  const user = await getUser(userId);
  return user.get('pincode') != null;
}

export async function checkUserPin(userId: number, pincode: string) {
  const user = await UserModel.where({ id: userId }).fetch();
  if (!user) {
    Logger.error(`Couldn't check PIN for user ${userId}`);
    throw new Error(`Couldn't check PIN for user ${userId}`);
  }

  const dbPin = user.get('pincode');
  const dbToken = user.get('token');

  if ((dbPin != null && !passwordHash.verify(pincode, dbPin)) || (dbToken != null && dbToken === pincode)) {
    throw new Error('Wrong Pin');
  }
}

export async function addUser(username: string) {
  if (!username.trim()) {
    throw new Error('Please enter a name');
  }
  const existingUser = await UserModel.where({ name: username }).fetch();
  if (existingUser) {
    Logger.error(`Couldn't save user ${username}, already exists`);
    throw new Error('User exists already.');
  }
  const user = await new UserModel({
    credit: 0,
    debtAllowed: true,
    lastchanged: new Date(),
    name: username,
  }).save({}, { method: 'insert' });
  //Logger.info(`[addUser] New user ${username} created`);

  return user;
}

export async function updateCredit(user: User, delta: number, description: string): Promise<UserModel> {
  user.credit += Number(delta);
  user.credit = Math.round(user.credit * 100) / 100;
  user.lastchanged = new Date();

  const transaction = new TransactionModel({
    userId: user.id,
    delta,
    credit: user.credit,
    time: new Date(),
    description,
  });
  await transaction.save({}, { method: 'insert' });

  let dbUser = await UserModel.where({ id: user.id }).fetch();
  if (!dbUser) {
    Logger.error(`Couldn't save transaction for user ${user.name}`);
    throw new Error(`failed to update Credit for user ${user.name}`);
  }
  dbUser = await dbUser.save({ credit: user.credit, lastchanged: new Date() });

  Logger.info(`[userCredit] Changed credit from user ${user.name} by ${delta}. New credit: ${user.credit}`);

  return dbUser;
}

export function getUserTransactions(userId: number) {
  return TransactionModel.where({
    // eslint-disable-next-line
    user_id: userId,
  }).fetchAll();
}

export async function getUserByToken(token: string) {
  const user = await UserModel.where({
    token,
  }).fetch();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function getUser(userId: number) {
  const user = await UserModel.where({
    id: userId,
  }).fetch();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function renameUser(
  user: User,
  newname: string // rawPincode?: string,
) {
  // let pincode;
  // if (rawPincode) {
  //   pincode = passwordHash.generate(rawPincode);
  // }

  const dbUser = await UserModel.where({
    id: user.id,
  }).fetch();
  if (!dbUser) {
    Logger.error(`Couldn't save user ${newname}`);
    throw new Error('Couldnt rename user');
  }
  if (dbUser.get('name') === newname) {
    throw new Error('Failed to rename to same name');
  }
  await dbUser.save({
    name: newname,
  });
  return dbUser;
}

export async function updatePin(userId: number, newPincode: string) {
  const user = await getUser(userId);
  let hashedPincode = null;

  if (newPincode) {
    hashedPincode = passwordHash.generate(newPincode);
  }
  if (!user) {
    throw new Error('User not found');
  }
  await user.save({ pincode: hashedPincode });
}
