// @flow
import passwordHash from 'password-hash';
import TransactionModel from '../Model/TransactionModel';
import UserModel from '../Model/UserModel';
import uuid from 'uuid';
import winston from 'winston';

export async function deleteUser(username: string, force: bool = false) {
  const user = await getUser(username);
  if (!force && user.get('credit') !== 0) {
    throw new Error('Cannot delete User unless 0 credit');
  }
  await user.destroy();
}

export async function updateToken(
  username: string,
  newToken: string
): Promise<UserModel> {
  const user = await UserModel.where({
    name: username,
  }).fetch();
  if (user) {
    return user.save({
      token: newToken,
    });
  }
  throw new Error('User not Found');
}

export function getAllUsers() {
  return UserModel.fetchAll({ columns: ['name', 'lastchanged', 'credit'] });
}

export async function checkUserPin(username: string, pincode: string) {
  const user = await UserModel.where({ name: username }).fetch();
  if (!user) {
    winston.error(`Couldn't check PIN for user ${username}`);
    throw new Error(`Couldn't check PIN for user ${username}`);
  }

  const dbPin = user.get('pincode');
  const dbToken = user.get('token');

  if (
    (dbPin != null && !passwordHash.verify(pincode, dbPin)) ||
    (dbToken != null && dbToken === pincode)
  ) {
    throw new Error('Wrong Pin');
  }
}

export async function addUser(username: string) {
  if (!username.trim()) {
    throw new Error('Please enter a name');
  }
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

export async function updateCredit(
  user: User,
  delta: number,
  description: string
): Promise<UserModel> {
  user.credit += Number(delta);
  user.credit = Math.round(user.credit * 100) / 100;
  user.lastchanged = new Date();

  const transaction = new TransactionModel({
    id: uuid.v4(),
    username: user.name,
    delta,
    credit: user.credit,
    time: new Date(),
    description,
  });
  await transaction.save({}, { method: 'insert' });

  let dbUser = await UserModel.where({ name: user.name }).fetch();
  if (!dbUser) {
    winston.error(`Couldn't save transaction for user ${user.name}`);
    throw new Error(`failed to update Credit for user ${user.name}`);
  }
  dbUser = await dbUser.save({ credit: user.credit, lastchanged: new Date() });

  winston.info(
    `[userCredit] Changed credit from user ${user.name} by ${delta}. New credit: ${user.credit}`
  );

  return dbUser;
}

export function getUserTransactions(username: string) {
  return TransactionModel.where({
    username,
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

export async function getUser(username: string) {
  const user = await UserModel.where({
    name: username,
  }).fetch();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export function renameUser(user: User, newname: string, rawPincode?: string) {
  let pincode;
  if (rawPincode) {
    pincode = passwordHash.generate(rawPincode);
  }
  const credit = user.credit;

  return bookshelf.transaction(async trx => {
    let newUser;
    try {
      newUser = await new UserModel({
        name: newname,
        credit,
        lastchanged: new Date(),
        pincode,
        debtAllowed: user.debtAllowed,
      }).save({}, { method: 'insert', transacting: trx });
    } catch (e) {
      winston.error(`Couldn't save user ${newname}`);
      throw e;
    }

    const oldUser = await UserModel.where({ name: user.name }).fetch({
      transacting: trx,
    });
    if (oldUser) {
      await oldUser.destroy({ transacting: trx });
    }
    const transactions = await TransactionModel.where({
      username: user.name,
    }).fetchAll({ transacting: trx });
    await Promise.all(
      transactions.map(t => t.save({ username: newname }, { transacting: trx }))
    );
    return newUser;
  });
}

export async function updatePin(username: string, newPincode: string) {
  let hashedPincode = null;

  if (newPincode) {
    hashedPincode = passwordHash.generate(newPincode);
  }
  const user = await UserModel.where({ name: username }).fetch();
  if (!user) {
    throw new Error('User not found');
  }
  await user.save({ pincode: hashedPincode });
}
