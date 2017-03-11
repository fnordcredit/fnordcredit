module.exports = {
  extends: "marudor/noReact",
  env: {
    node: true,
    jest: true
  },
  globals: {
    knex: false,
    bookshelf: false,
    koa: false,
    broadcast: false,
  }
};
