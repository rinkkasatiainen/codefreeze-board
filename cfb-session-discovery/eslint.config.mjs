import {eslintConfig, rules} from '@rinkkasatiainen/eslint-config/js'

export default [
  {
    ...eslintConfig,
  },
  {
    plugins: eslintConfig.plugins,
    rules: rules.recommended,
  },
  {
    rules: {
      'mocha/no-top-level-hooks': 'off',
      // '@stylistic/no-multiple-empty-lines': 'error',
      '@stylistic/no-multiple-empty-lines': ['error', {max: 1, maxEOF: 1}],
      '@stylistic/no-multi-spaces': 'warn',
      'no-unused-vars': ['error', {args: 'after-used', varsIgnorePattern: '^_', argsIgnorePattern: '^_'}],
    }
  }
]
