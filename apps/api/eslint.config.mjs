import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      sourceType: 'commonjs',
    },
    rules: {
      ...js.configs.recommended.rules,
      // Permissive for Phase 1 - will tighten in future phases
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-prototype-builtins': 'warn',
      'no-useless-catch': 'warn',
    },
  },
];
