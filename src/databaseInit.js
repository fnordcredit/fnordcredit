// @flow
const Knex = require('knex');
const Bookshelf = require('bookshelf');
const config = require('../config');

if (process.env.NODE_ENV === 'test') {
  Object.assign(config.db.connection, config.testDbConnection);
}
global.knex = Knex(config.db);
global.bookshelf = Bookshelf(global.knex);
