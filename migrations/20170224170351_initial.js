
exports.up = function(knex) {
  return Promise.all([knex.raw(`
    CREATE TABLE IF NOT EXISTS "transaction"
    (
      credit INT NOT NULL,
      delta INT NOT NULL,
      description TEXT NOT NULL,
      id UUID PRIMARY KEY NOT NULL,
      time TIMESTAMP NOT NULL,
      username TEXT NOT NULL
    );
    `
  ), knex.raw(`
    CREATE TABLE IF NOT EXISTS "user"
    (
      credit INT NOT NULL,
      debt_allowed BOOL NOT NULL,
      debt_hard_limit INT,
      lastchanged TIMESTAMP NOT NULL,
      name TEXT NOT NULL PRIMARY KEY,
      pincode TEXT,
      token TEXT
    );
    `
  )]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.raw('DROP TABLE IF EXISTS "transaction"'),
    knex.raw('DROP TABLE IF EXISTS "user"'),
  ]);
};
