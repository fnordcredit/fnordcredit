exports.up = async function(knex) {
  // we need to add a column at the front
  // -> do the copy&delete-dance
  await knex.raw(
    `
    CREATE TABLE IF NOT EXISTS "user_new"
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
  await knex.raw('insert into user_new select ROWID as id, credit, debt_allowed, debt_hard_limit, lastchanged, name, pincode, token from user;');
  await knex.raw('drop table user;');
  await knex.raw('alter table user_new rename to user;');


  await knex.raw(
    `
    CREATE TABLE IF NOT EXISTS "transaction_new"
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
    `
    INSERT INTO "transaction_new"
    SELECT "transaction".ROWID as id, "transaction".credit, delta, description, time, user.id as user_id
    FROM "transaction"
    JOIN user on user.name = "transaction".username;
    `
  );
  await knex.raw('drop table "transaction";');
  await knex.raw('alter table "transaction_new" rename to "transaction";');
};

exports.down = function(knex) {};
