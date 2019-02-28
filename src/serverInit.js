// @flow
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import Static from 'koa-static';

function errorHandler(ctx: Koa$Context, next: Function) {
  return next().catch(e => {
    ctx.status = 500;
    ctx.body = e.message;
  });
}

const koa = new Koa();

koa.use(errorHandler);
koa.use(Static(`${__dirname}/../node_modules/fnordcredit-frontend`));
koa.use(bodyParser());

global.koa = koa;

require('./Routes');
