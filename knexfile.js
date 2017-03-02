// @flow
const config = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: process.env.DB_CONNECTION_FILENAME || 'example.db',
  },
};

module.exports = {
  development: config,
  production: config,
  test: config,
};
