import prettierPlugin from 'eslint-plugin-prettier';
import {eslintConfig, rules} from '@rinkkasatiainen/eslint-config/js'
// import stylisticJs from "@stylistic/eslint-plugin";
// import mochaPlugin from "eslint-plugin-mocha";

export default [
  {
    ...eslintConfig
  },
  {
    // Uncomment this, if you want prettier in project
    plugins: {
      "prettier": prettierPlugin
    },
    rules: rules.prettier
  },
  {
    plugins: eslintConfig.plugins,
    rules: rules.recommended
  }
]
