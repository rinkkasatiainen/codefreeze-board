const noop = () => { /* noop */ }
const todo = testName => {

  xit(testName, noop)
}

describe('AuthorizationModule', () => {
  todo('Should initialize auth storage on configure')
  todo('Should register CfbLoginForm custom element on run')
  todo('Should register CfbAuthStatus custom element on run')
  todo('Should register CfbChangePassword custom element on run')
  todo('Should not register element if it is already defined')
  todo('Should handle activation logic when activate is called')
})

