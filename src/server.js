// @flow
import './databaseInit';
import './serverInit';
import winston from 'winston';

process.stdin.resume();
winston.add(winston.transports.File, { filename: 'credit.log', json: false });

function serverStart() {
  let server = require('http').createServer(koa.callback());
  require('./primusInit').default(server);

  server = server.listen(8000, undefined, undefined, () => {
    winston.info('Server started!');
  });

  process.on('SIGTERM', () => {
    winston.info('Server shutting down. Good bye!');
    process.exit();
  });
}

serverStart();

if (process.argv.includes('--test', 2)) {
  process.exit(0);
}
