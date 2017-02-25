// @flow
import { addUser, deleteUser, getUser, updatePin } from '../UserService';
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

  it('delete user', async () => {
    await deleteUser('test');
  });
});
