// @flow
import './databaseInit';
import { getAllUsers } from './Service/UserService';
import './serverInit';
import winston from 'winston';

let io;

let sock: any = {
  // eslint-disable-next-line
  emit() {}
};

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });
let users;

function serverStart() {
  let server = require('http').createServer(koa.callback());
  io = require('socket.io').listen(server);

  io.sockets.on('connection', socket => {
    sock = socket;

    getAllUsers().then(data => socket.emit('accounts', JSON.stringify(data)));

    socket.on('getAccounts', () => {
      getAllUsers().then(data => socket.emit('accounts', JSON.stringify(data)));
    });
  });

  server = server.listen(8000, undefined, undefined, () => {
    winston.info('Server started!');

    setInterval(
      () => {
        if (sock.broadcast) {
          getAllUsers().then(users =>
            sock.broadcast.emit('accounts', JSON.stringify(users)));

          sock.broadcast.emit('accounts', JSON.stringify(users));
        }
      },
      10 * 1000
    );
  });
}

process.on('SIGTERM', () => {
  winston.info('Server shutting down. Good bye!');
  process.exit();
});

serverStart();

if (process.argv.includes('--test', 2)) {
  process.exit(0);
}
