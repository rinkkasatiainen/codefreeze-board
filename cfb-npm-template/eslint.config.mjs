import {eslintConfig, rules} from '@rinkkasatiainen/eslint-config/js'

export default [
  {
    ...eslintConfig,
  },
  {
    plugins: eslintConfig.plugins,
    rules: rules.recommended,
  },
]
