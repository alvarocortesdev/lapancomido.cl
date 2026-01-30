import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
