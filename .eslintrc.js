module.exports = {
    "extends": ["eslint:recommended", "google"],
    "parserOptions": {
        "ecmaVersion": 8
    },
    "rules": {
        "require-jsdoc": "off"
    },
    "env": {
        "es6": true,
        "mocha": true,
        "node": true
    }
};
