// @flow
const Knex = require('knex');

const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: './prod.db',
  },
};

global.knex = Knex(dbConfig);
