// @flow
import {
  addUser,
  deleteUser,
  getUser,
  renameUser,
  updateCredit,
  updatePin,
  updateToken,
} from '../UserService';
import passwordHash from 'password-hash';
import type UserModel from '../../Model/UserModel';

describe('UserService', () => {
  let user: UserModel;

  it('create user', async () => {
    user = await addUser('test');
    expect(user).toBeDefined();
  });

  it('update Pin', async () => {
    const pin = '0000';
    await updatePin(user.id, pin);
    user = await getUser(user.id);
    expect(passwordHash.verify(pin, user.get('pincode'))).toBe(true);
  });

  it('renameUser', async () => {
    user = await getUser(user.id);
    user = await renameUser(user.serialize(), 'testNew');
    const dbUser = await getUser(user.id);
    expect(user).toBeDefined();
    expect(dbUser).toBeDefined();
    expect(user.get('name')).toBe(dbUser.get('name'));
  });

  it('renameUser doesnt work for same', async () => {
    try {
      await renameUser(user.serialize(), 'testNew');
      throw new Error('foo');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).not.toBe('foo');
    }
  });

  it('updateToken', async () => {
    user = await updateToken(user.id, 'token');
    expect(user.get('token')).toBe('token');
  });

  it('add 1€', async () => {
    user = await updateCredit(user.serialize(), 1, '1');
    expect(user.get('credit')).toBe(1);
    const dbUser = await getUser(user.id);
    expect(user.get('credit')).toBe(dbUser.get('credit'));
  });

  it('go into negative', async () => {
    user = await updateCredit(user.serialize(), -2, '-2');
    expect(user.get('credit')).toBe(-1);
    const dbUser = await getUser(user.id);
    expect(user.get('credit')).toBe(dbUser.get('credit'));
  });

  it('can not create user with only spaces', async () => {
    try {
      await addUser('    ');
      throw new Error('shouldnt happen');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe('Please enter a name');
    }
  });

  it('delete user', async () => {
    try {
      await deleteUser(user.id, true);
    } catch (e) {
      //
    }
  });
});
