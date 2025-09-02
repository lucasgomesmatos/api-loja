// Flat ESLint config (ESLint >=9) adaptado manualmente a partir do preset @rocketseat/eslint-config/node
// porque o preset antigo usa formato .eslintrc.

import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import nPlugin from 'eslint-plugin-n';
import prettierPlugin from 'eslint-plugin-prettier';
import promisePlugin from 'eslint-plugin-promise';
import globals from 'globals';

export default [
  {
    ignores: ['build', 'node_modules'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
      promise: promisePlugin,
      import: importPlugin,
      n: nPlugin,
    },
    rules: {
      // Base equivalentes do preset
      ...tsPlugin.configs.recommended.rules,
      'prettier/prettier': 'off',
      camelcase: 'off',
      'no-useless-constructor': 'off',
      'no-empty-function': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/order': [
        'warn',
        {
          'alphabetize': { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
    },
  },
];
