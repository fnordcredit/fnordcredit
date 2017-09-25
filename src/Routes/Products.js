// @flow
import Router from 'koa-router';
import { getAllProducts } from 'Service/ProductService';

const router = new Router();

router
  .prefix('/products')
  .get('/all', async ctx => {
    ctx.body = await getAllProducts();
  });

koa.use(router.routes());
