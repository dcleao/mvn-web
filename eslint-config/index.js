module.exports = {
  "extends": ["eslint:recommended", "prettier"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "env": {
    "es6": true
  },
  "rules": {
    "prettier/prettier": "error"
  },
  "globals": {
  }
};
