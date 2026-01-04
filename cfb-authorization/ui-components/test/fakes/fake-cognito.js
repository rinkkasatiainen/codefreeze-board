// eslint-disable-next-line max-classes-per-file
import sinon from 'sinon'

class CognitoUserPool  {
  #data
  constructor(data) {
    this.#data = data
  }

}
class AuthenticationDetails {
  #data
  constructor(data) {
    this.#data = data
  }

}

// Helper to create a fake token object
function createFakeToken(jwtToken, expiration) {
  return {
    getJwtToken: () => jwtToken,
    getToken: () => jwtToken,
    getExpiration: () => expiration || Math.floor(Date.now() / 1000) + 3600, // Default 1 hour from now
  }
}

// Helper to create a fake session object
export function createFakeSession(options = {}) {
  const {
    accessToken = 'fake-access-token',
    idToken = 'fake.id.token',
    refreshToken = 'fake-refresh-token',
    expiration = Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  } = options

  return {
    getAccessToken: () => createFakeToken(accessToken, expiration),
    getIdToken: () => createFakeToken(idToken, expiration),
    getRefreshToken: () => createFakeToken(refreshToken, expiration),
  }
}

export const authenticateUserStub = sinon.stub()
export const completeNewPasswordChallengeStub = sinon.stub()
export const changePasswordStub = sinon.stub()

class CognitoUser {
  #data
  constructor(data) {
    this.#data = data
  }

  authenticateUser = authenticateUserStub
  changePassword = changePasswordStub
  completeNewPasswordChallenge = completeNewPasswordChallengeStub
}

class CognitoRefreshToken {
  #data
  constructor(data) {
    this.#data = data
  }
}

export { CognitoUserPool, AuthenticationDetails, CognitoUser, CognitoRefreshToken }
