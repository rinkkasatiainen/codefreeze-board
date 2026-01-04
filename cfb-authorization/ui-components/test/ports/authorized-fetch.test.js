const noop = () => { /* noop */ }
const todo = testName => {

  xit(testName, noop)
}

describe('authorizedFetch', () => {
  todo('Should add Authorization header with access token to requests')
  todo('Should use root URL from CFB_CONFIG')
  todo('Should use default root URL when not specified in config')
  todo('Should make fetch request with correct URL and headers')
  todo('Should return response when request is successful')
  todo('Should refresh token and retry request on 401 response')
  todo('Should update Authorization header with new token on retry')
  todo('Should clear tokens and dispatch cfb-auth-failed event when refresh fails')
  todo('Should return original 401 response when refresh fails')
  todo('Should not retry request when no access token is available')
  todo('Should handle missing CFB_CONFIG gracefully')
  todo('Should preserve original fetch options when retrying')
  todo('Should handle fetch errors appropriately')
})

