exports.up = async function(knex) {
  return knex.schema
   .createTable('products', function (table) {
       table.increments('id').primary();
       table.string('name').unique().notNullable();
       table.integer('price').notNullable();
       table.string('category').notNullable();
       table.string('ean').notNullable();
       table.string('image_path');
    });
};

exports.down = function(knex) {};
