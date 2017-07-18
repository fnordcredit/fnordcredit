// @flow

import './databaseInit';

afterAll(() => {
  knex.destroy();
});
