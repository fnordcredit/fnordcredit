exports.up = async function(knex) {
  // sqlite does not support alter column
  // => create new table and rename
  await knex.schema
    .createTable('user_new', function (table) {
       table.increments('id').primary();
       table.integer('credit').notNullable();
       table.boolean('debt_allowed').notNullable();
       table.integer('debt_hard_limit');
       table.timestamp('lastchanged').notNullable();
       table.string('name').unique().notNullable();
       table.string('pincode');
       table.string('token');
    });

  // TODO: test statement against all supported SQL servers
  await knex.raw(`
            INSERT INTO user_new (credit, debt_allowed, debt_hard_limit, lastchanged, name, pincode, token)
            SELECT credit, debt_allowed, debt_hard_limit, lastchanged, name, pincode, token
            FROM user
  `);

  await knex.schema
    .dropTable('user')
    .renameTable('user_new', 'user')
    .createTable('transaction_new', function (table) {
       table.increments('id').primary();
       table.integer('credit').notNullable();
       table.integer('delta').notNullable();
       table.string('description').notNullable();
       table.timestamp('time').notNullable();
       table.integer('user_id').notNullable(); //TODO: does this work in postgres?

       table.foreign('user_id').references('id').inTable('user');
    });


  await knex.raw(//TODO: does " work on every database? which escaping-character does?
    `
    INSERT INTO transaction_new (credit, delta, description, time, user_id)
    SELECT "transaction".credit, delta, description, time, user.id as user_id
    FROM "transaction"
    JOIN user on user.name = "transaction".username;
    `
  );
  
  await knex.schema
    .dropTable('transaction')
    .renameTable('transaction_new', 'transaction')
};

exports.down = function(knex) {};
