// @flow
import { getAllUsers } from './Service/UserService';
import Primus from 'primus';
import Router from 'koa-router';
import type { Server } from 'http';

export default function(server: Server) {
  const router = new Router();
  const primus = new Primus(server, {
    compression: true,
    transformer: 'engine.io',
  });
  primus.plugin('emit', require('primus-emit'));

  router.get('/sockets.js', ctx => {
    ctx.body = primus.library();
  });
  koa.use(router.routes());

  global.broadcast = function(...args) {
    primus.forEach(s => s.emit(...args));
  };

  primus.on('connection', spark => {
    getAllUsers().then(data => spark.emit('accounts', data));

    spark.on('getAccounts', () => {
      getAllUsers().then(data => spark.emit('accounts', data));
    });
  });

  setInterval(() => {
    getAllUsers().then(users => broadcast('accounts', users));
  }, 10 * 1000);

  return primus;
}
