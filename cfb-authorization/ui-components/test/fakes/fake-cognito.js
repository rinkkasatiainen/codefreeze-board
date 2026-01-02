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
class CognitoUser {
  #data
  constructor(data) {
    this.#data = data
  }

  authenticateUser = sinon.stub()

}


export { CognitoUserPool, AuthenticationDetails, CognitoUser }
