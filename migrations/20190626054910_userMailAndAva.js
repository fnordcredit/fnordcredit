exports.up = async function(knex) {
  await knex.raw('ALTER TABLE user ADD COLUMN avatar TEXT;');
  await knex.raw('ALTER TABLE user ADD COLUMN email TEXT;');
};

exports.down = function(knex) {};
