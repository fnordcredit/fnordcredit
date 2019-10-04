exports.up = async function(knex) {
  await knex.raw(
    `
      CREATE TABLE IF NOT EXISTS "products"
      (
        id integer primary key AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price INT NOT NULL,
        category TEXT NOT NULL,
        ean TEXT NOT NULL,
        image_path TEXT
      );
    `
  );
};

exports.down = function(knex) {};
