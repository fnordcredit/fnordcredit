exports.up = async function(knex) {
 return knex.schema
   .alterTable('user', function(table) {
       table.string('avatar');
       table.string('email');
   });
};

exports.down = function(knex) {};
