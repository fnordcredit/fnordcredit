// @flow
import { addUser, deleteUser } from '../UserService';

describe('UserService', () => {
  it('create user', async () => {
    const user = await addUser('test');
    expect(user).toBeDefined();
  });

  it('delete user', async () => {
    await deleteUser('test');
  });
});
