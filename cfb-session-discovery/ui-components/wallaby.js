export default function () {
  return {
    reportConsoleErrorAsError: true,

    files: ['package.json', 'src/**/*.js'],
    tests: ['test/**/*.test.js'],
    testFramework: 'mocha',
    env: {type: 'node'},

    symlinkNodeModules: true,   // can be removed if `package.json` contains `"type": "module"`
    workers: { restart: true },  // IMPORTANT
  }
}
