module.exports = function() {
  return {
    reportConsoleErrorAsError: true,

    files: [ './src/**/*.js' ],
    tests: ['./test/**/*.test.js'],
    testFramework: 'mocha',
  }
}
