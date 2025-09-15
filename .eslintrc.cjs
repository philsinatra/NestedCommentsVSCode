module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    // extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['*.cjs', '*.svelte'],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
    },
    env: {
        browser: true,
        es2017: true,
        node: true
    }
};
