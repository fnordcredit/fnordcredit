// @flow
require("dotenv").config();

const sqlite3config = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: process.env.DB_CONNECTION_FILENAME || 'example.db',
  },
};

const mysqlconfig = {
  client: 'mysql',
  useNullAsDefault: true,
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'fnordcredit'
  }
};

module.exports = {
  development: sqlite3config,
  production: process.env.USE_MYSQL ? mysqlconfig : sqlite3config,
  test: sqlite3config,
};
