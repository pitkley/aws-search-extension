/* global module */

module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "webextensions": true,
    },
    "extends": "eslint:recommended",
    "globals": {
        "browser": "readonly",
        "Command": "readonly",
    },
    "parserOptions": {
        "ecmaVersion": "latest",
    },
    "ignorePatterns": [
        "/core",
        "/docs",
        "/extension/core/**/*",
        "/extension/index/**/*",
        "/extension/vendored/**/*",
        "/hack",
        "/index-sources",
        "/json-indices",
        "/profiles",
    ],
    "rules": {
        "brace-style": [
            "error",
            "1tbs",
            {"allowSingleLine": false},
        ],
        "comma-dangle": [
            "error",
            "always-multiline",
        ],
        "indent": [
            "error",
            4,
        ],
        "linebreak-style": [
            "error",
            "unix",
        ],
        "no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "(_.*|rest)",
                "ignoreRestSiblings": true,
            },
        ],
        "quotes": [
            "error",
            "double",
        ],
        "semi": [
            "error",
            "always",
        ],
        "space-before-function-paren": [
            "error",
            {
                "anonymous": "always",
                "named": "never",
            },
        ],
    },
};
