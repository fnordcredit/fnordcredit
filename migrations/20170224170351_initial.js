exports.up = function(knex) {
  return knex.schema
   .createTable('transaction', function (table) {
       table.integer('credit').notNullable();
       table.integer('delta').notNullable();
       table.string('description').notNullable();
       table.uuid('id').primary().notNullable();
       table.timestamp('time').notNullable();
       table.string('username').notNullable();
    })
    .createTable('user', function (table) {
       table.integer('credit').notNullable();
       table.boolean('debt_allowed').notNullable();
       table.integer('debt_hard_limit');
       table.timestamp('lastchanged').notNullable();
       table.string('name').primary().notNullable();
       table.string('pincode');
       table.string('token');
    });
};

exports.down = function(knex) {
  return knex.schema
   .dropTable('transaction')
   .dropTable('user');
};
