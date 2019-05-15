module.exports = {
  extends: 'airbnb/base',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  env: {
    browser: true,
    mocha: true,
    node: true,
    es6: true,
    jest: true,
  },
  plugins: [
    'import',
    'mocha',
  ],
  rules: {
    'implicit-arrow-linebreak': 'off',
    'consistent-return': 'off',
  },
};
