exports.up = async function(knex) {
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
      token TEXT,
      avatar TEXT,
      email TEXT
    );
    `
  );
  await knex.raw('insert into user select *, null, null from user_tmp;');
  await knex.raw('drop table user_tmp;');
};

exports.down = function(knex) {};
