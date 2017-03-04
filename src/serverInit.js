// @flow
import bodyParser from 'koa-bodyparser';
import Koa from 'koa';
import Static from 'koa-static';

const koa = new Koa();

koa.use(Static(`${__dirname}/../static`));
koa.use(bodyParser());

global.koa = koa;

require('./Routes');
