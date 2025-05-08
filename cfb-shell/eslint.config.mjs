import prettierPlugin from 'eslint-plugin-prettier'
import {eslintConfig, rules} from '@rinkkasatiainen/eslint-config/js'
// import stylisticJs from "@stylistic/eslint-plugin";
// import mochaPlugin from "eslint-plugin-mocha";

export default [
  {
    ...eslintConfig,
  },
  {
    plugins: eslintConfig.plugins,
    rules: rules.recommended,
  },
  { rules: {
    'mocha/no-top-level-hooks': 'off',
  }},
]
