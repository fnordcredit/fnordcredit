// @flow
import { getUserByToken } from 'Service/UserService';
import Router from 'koa-router';

const router = new Router();

router.prefix('/token').get('/:token', async ctx => {
  const { token } = ctx.params;
  ctx.body = await getUserByToken(token);
});

koa.use(router.routes());
