module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // enforce curly brace usage
    curly: ['error', 'all'],
    // enforce consistent sort order
    'sort-imports': ['error', { ignoreCase: true, ignoreDeclarationSort: true }],
  },
};
