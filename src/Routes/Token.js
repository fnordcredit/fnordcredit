// @flow
import { getUserByToken } from 'Service/UserService';
import Router from 'koa-router';

const router = new Router();

router.prefix('/token').get('/:token', async ctx => {
  const { token }: { token: string } = ctx.params;
  ctx.body = await getUserByToken(token);
});

koa.use(router.routes());
