// @flow
import { addUser, deleteUser, getUser, renameUser, updatePin } from '../UserService';
import passwordHash from 'password-hash';

describe('UserService', () => {
  it('create user', async () => {
    const user = await addUser('test');
    expect(user).toBeDefined();
  });

  it('update Pin', async () => {
    const pin = '0000';
    await updatePin('test', pin);
    const user = await getUser('test');
    expect(passwordHash.verify(pin, user.get('pincode'))).toBe(true);
  });

  it('renameUser', async () => {
    let user = await getUser('test');
    await renameUser(user.serialize(), 'testNew');
    user = await getUser('testNew');
    expect(user).toBeDefined();
  });

  it('renameUser doesnt work for same', async () => {
    try {
      const user = await getUser('testNew');
      await renameUser(user.serialize(), 'testNew');
      throw new Error('foo');
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).not.toBe('foo');
    }
  });

  it('delete user', async () => {
    await deleteUser('test');
    await deleteUser('testNew');
  });
});
