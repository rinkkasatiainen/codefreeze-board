import {eslintConfig} from '@rinkkasatiainen/eslint-config.js'

export default [
  {
    ...eslintConfig,
  },
  {
    rules: {
      'no-unused-vars': ['error', {args: 'after-used', varsIgnorePattern: '^_', argsIgnorePattern: '^_'}],
    }
  }
]

