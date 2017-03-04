// @flow
import { getAllUsers } from 'Service/UserService';
import Router from 'koa-router';

const router = new Router();

router.prefix('/users').get('/all', async ctx => {
  ctx.body = await getAllUsers();
});

koa.use(router.routes());
