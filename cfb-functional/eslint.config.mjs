import { eslintConfig, rules } from '@rinkkasatiainen/eslint-config.js'

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
      'no-unused-vars': ['error', { args: 'after-used', varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
]


