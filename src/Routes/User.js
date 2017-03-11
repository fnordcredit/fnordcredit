// @flow
import {
  addUser,
  deleteUser,
  getAllUsers,
  getUser,
  renameUser,
  updateCredit,
  updatePin,
  updateToken,
} from 'Service/UserService';
import config from '../config';
import pinMiddleware from './pinMiddleware';
import Router from 'koa-router';

async function emit() {
  const users = await getAllUsers();
  broadcast('accounts', users);
}

const router = new Router();

router
  .prefix('/user')
  .use(pinMiddleware)
  .get('/:username', async ctx => {
    const username = ctx.params.username;
    ctx.body = await getUser(username);
  })
  .delete('/:username', async ctx => {
    const username = ctx.params.username;
    await deleteUser(username);
    ctx.status = 200;
  })
  .post('/add', async ctx => {
    await addUser(ctx.request.body.username);
    ctx.body = await getAllUsers();
    emit();
  })
  .post('/rename', async ctx => {
    const { username, newname } = ctx.request.body;
    const pincode = ctx.request.header['X-User-Pincode'];
    const user = await getUser(username);
    await renameUser(user.serialize(), newname, pincode);
    const users = await getAllUsers();
    emit();
    ctx.body = users;
  })
  .post('/credit', async ctx => {
    const { username, product, description } = ctx.request.body;
    const delta = parseFloat(ctx.request.body.delta);
    if (isNaN(delta) || delta >= 100 || delta <= -100) {
      throw new Error('[userCredit] delta must be a anumber.');
    }
    const dbUser = await getUser(username);
    const user = dbUser.serialize();
    if (delta < 0 && user.credit + delta < 0) {
      if (!config.debtAllowed) {
        throw new Error(
          '[userCredit] negative credit not allowed in configuration.'
        );
      }
      if (!user.debtAllowed) {
        throw new Error(
          `[userCredit] negative credit not allowed for user ${user.name} - (debtAllowed: ${user.debtAllowed ? 'true' : 'false'})`
        );
      }
      if (user.credit + delta < config.maxDebt) {
        throw new Error(
          `[userCredit] credit below ${config.maxDebt} € not allowed in configuration.`
        );
      }
      if (user.debtHardLimit && user.credit + delta < user.debtHardLimit) {
        throw new Error(
          `[userCredit] credit below ${user.debtHardLimit || ''} for user ${user.name} not allowed`
        );
      }
    }
    ctx.body = await updateCredit(user, delta, description, product);
    emit();
  })
  .post('/change-pin', async ctx => {
    const { username, pincode } = ctx.request.body;
    const user = await getUser(username);
    await updatePin(user.get('name'), pincode);
    ctx.body = 'PIN updated successfully';
  })
  .post('/change-token', async ctx => {
    const { username, newtoken } = ctx.request.body;
    const user = await getUser(username);
    await updateToken(user.get('name'), newtoken);
    ctx.body = 'Tokens updated successfully';
  });

koa.use(router.routes());
