// @flow
import './databaseInit';
import './serverInit';
import Logger from 'Logger';

process.stdin.resume();

function serverStart() {
  let server = require('http').createServer(koa.callback());
  require('./primusInit').default(server);

  server = server.listen(8000, undefined, undefined, () => {
    Logger.info('Server started!');
  });

  process.once('SIGTERM', () => {
    Logger.info('Server shutting down. Good bye!');
    process.exit();
  });
}

serverStart();

if (process.argv.includes('--test', 2)) {
  process.exit(0);
}
