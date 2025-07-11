const noop = () => { /* noop */ }
// eslint-disable-next-line mocha/no-exports
export const todo = testName => {
  // eslint-disable-next-line mocha/no-pending-tests
  xit(testName, noop)
}

// eslint-disable-next-line mocha/no-exports
export const testList = (message, callback) => {
  describe(message, callback)
}
