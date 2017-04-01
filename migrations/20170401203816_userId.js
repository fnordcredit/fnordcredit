exports.up = async function(knex, Promise) {
  await knex.raw('alter table user rename to user_tmp;');
  await knex.raw(
    `
    CREATE TABLE IF NOT EXISTS "user"
    (
      id integer primary key AUTOINCREMENT,
      credit INT NOT NULL,
      debt_allowed BOOL NOT NULL,
      debt_hard_limit INT,
      lastchanged TIMESTAMP NOT NULL,
      name TEXT NOT NULL UNIQUE ,
      pincode TEXT,
      token TEXT
    );
    `
  );
  await knex.raw('insert into user select ROWID as id, * from user_tmp;');
  await knex.raw('drop table user_tmp;');
  await knex.raw('alter table "transaction" rename to transaction_tmp;');
  await knex.raw(
    `
    CREATE TABLE IF NOT EXISTS "transaction"
    (
      id integer PRIMARY KEY AUTOINCREMENT,
      credit INT NOT NULL,
      delta INT NOT NULL,
      description TEXT NOT NULL,
      time TIMESTAMP NOT NULL,
      user_id integer not null references user(id) on delete cascade
    );
    `
  );
  await knex.raw(
    'insert into "transaction" select transaction_tmp.ROWID as id, transaction_tmp.credit, delta, description, time, user.id as user_id from transaction_tmp join user on user.name = transaction_tmp.username;'
  );
  await knex.raw('drop table transaction_tmp;');
};

exports.down = function(knex, Promise) {};
