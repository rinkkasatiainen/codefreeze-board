const noop = () => { /* noop */ }
const todo = testName => {

  xit(testName, noop)
}

describe('CfbAuthStatus', () => {

  describe('when authenticated', () => {
    todo('Should render logged-in status with username when user is authenticated')
    todo('Should escape HTML in username display')
    todo('Should show logout button when user is authenticated')
    todo('Should handle logout button click')
    todo('Should clear tokens on logout')
  })

  describe('when not authenticated', () => {
    todo('Should render login link when user is not authenticated')

  })

  describe('when token is expired', () => {
    todo('should clear tokens on render if token is expired')
  })

  describe('login/logout behavior', () => {
    todo('Should dispatch cfb-logout-success event on logout')
    todo('Should redirect to login page on logout')
    todo('Should update display when cfb-login-success event is received')
    todo('Should re-check authentication status when login success event is received')
  })

  todo('Should handle logout errors gracefully')
})

