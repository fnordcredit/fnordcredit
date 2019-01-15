// @flow
import Bookshelf from 'bookshelf';
import config from '../knexfile';
import Knex from 'knex';

global.knex = Knex(config[process.env.production ? 'production' : 'development']);
global.bookshelf = Bookshelf(global.knex);
