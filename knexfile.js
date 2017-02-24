// @flow
const config = require('./config');

if (process.env.NODE_ENV === 'test') {
  Object.assign(config.db.connection, config.testDbConnection);
}

module.exports = {
  development: config.db,
  production: config.db,
  test: config.db,
};
