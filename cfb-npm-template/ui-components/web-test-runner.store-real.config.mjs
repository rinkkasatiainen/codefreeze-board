
export default {
  nodeResolve: true,
  browserStartTimeout: 60000,
  testFramework: {
    config: {
      timeout: 3000,
    },
  },
  files: ['test/**/*.test.js'],
}
