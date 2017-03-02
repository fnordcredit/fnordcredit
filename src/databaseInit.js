// @flow
import Bookshelf from 'bookshelf';
import Knex from 'knex';

const config = {
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: process.env.DB_CONNECTION_FILENAME || 'example.db',
  },
};

global.knex = Knex(config);
global.bookshelf = Bookshelf(global.knex);
