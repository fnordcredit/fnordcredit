// @flow
import { checkUserPin, getUserTransactions, getUserTransactionsAsQIF } from 'Service/UserService';
import Router from 'koa-router';
import TransactionModel from 'Model/TransactionModel';

const router = new Router();

router
  .prefix('/transactions')
  .get('/all', async ctx => {
    ctx.body = await TransactionModel.fetchAll();
  })
  .get('/:id', async ctx => {
    const { id }: { id: number } = ctx.params;
    const pincode = ctx.request.header['X-User-Pincode'];
    await checkUserPin(id, pincode);
    ctx.body = await getUserTransactions(id);
  })
  .get('/export/:id/transactions.qif', async ctx => {
    const { id }: { id: number } = ctx.params;
    const pincode = ctx.request.header['X-User-Pincode'];
    await checkUserPin(id, pincode);
    ctx.type = "text/qif";
    ctx.body = await getUserTransactionsAsQIF(id);
  });

koa.use(router.routes());
