export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    env: { node: true },
    extends: ['eslint:recommended'],
    rules: {
      'no-console': 'off',
      'prefer-const': 'error'
    }
  }
]
