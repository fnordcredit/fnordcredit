module.exports = {
  //extends: 'marudor/noReact',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    node: true,
    jest: true,
    es6: true,
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
    'space-before-function-paren': 0,
  },
};
