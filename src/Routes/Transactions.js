// @flow
import { checkUserPin, getUserTransactions } from 'Service/UserService';
import Router from 'koa-router';
import TransactionModel from 'Model/TransactionModel';

const router = new Router();

router
  .prefix('/transactions')
  .get('/all', async ctx => {
    ctx.body = await TransactionModel.fetchAll();
  })
  .get('/:username', async ctx => {
    const { username } = ctx.params;
    const pincode = ctx.request.header['X-User-Pincode'];
    await checkUserPin(username, pincode);
    ctx.body = await getUserTransactions(username);
  });

koa.use(router.routes());
