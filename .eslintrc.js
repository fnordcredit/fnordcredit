module.exports = {
  extends: 'marudor/noReact',
  env: {
    node: true,
    jest: true,
  },
  globals: {
    knex: false,
    bookshelf: false,
    koa: false,
    broadcast: false,
  },
  rules: {
    'comma-dangle': [
      2,
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
  },
};
