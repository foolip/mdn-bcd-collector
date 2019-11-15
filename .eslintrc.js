module.exports = {
    "extends": ["eslint:recommended", "google"],
    "parserOptions": {
        "ecmaVersion": 8
    },
    "rules": {
        "comma-dangle": ["error", "never"],
        "require-jsdoc": "off"
    },
    "env": {
        "es6": true,
        "mocha": true,
        "node": true
    }
};
