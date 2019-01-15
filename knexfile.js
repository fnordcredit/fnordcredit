// @flow
require("dotenv").config();

const sqlite3config = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: process.env.DB_CONNECTION_FILENAME || 'example.db',
  },
};

module.exports = {
  development: sqlite3config,
  production: sqlite3config,
  test: sqlite3config,
};
