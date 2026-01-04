import { expect } from 'chai'
import { restore, stub } from 'sinon'
import { tick } from '@rinkkasatiainen/cfb-testing-utils'
import { CfbLoginForm } from '../../src/components/cfb-login-form.js'
import authStorage from '../../src/storage/auth-storage.js'
import { authenticateUserStub, createFakeSession } from '../fakes/fake-cognito.js'
import { decodesIdTokenStub } from '../fakes/decodes-id-token.js'
import { redirectToSpy } from '../fakes/redirect-to.js'

const exampleEmail = 'test@rinkkasatiainen.dev'

describe('CfbLoginForm', () => {
  let testRoot = null
  const authStorageStubs = {}

  before(() => {
    customElements.define(CfbLoginForm.elementName, CfbLoginForm)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    window.CFB_CONFIG = {
      userPoolId: 'test-pool-id',
      clientId: 'test-client-id',
      region: 'missing',
      rootUrl: 'https://test.example.com',
    }
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)
    // Reset stubs
    authStorageStubs.saveTokens = stub(authStorage, 'saveTokens').resolves()
    // Clear sessionStorage
    sessionStorage.clear()
  })

  afterEach(() => {
    testRoot.innerHTML = ''
    restore()
    sessionStorage.clear()
    authenticateUserStub.reset()
    decodesIdTokenStub.reset()
  })

  const createSut = () => {
    const sut = document.createElement(CfbLoginForm.elementName)
    testRoot.appendChild(sut)
    return sut
  }

  const fillForm = (sut, username = 'testuser', password = 'testpass') => {
    const usernameInput = sut.querySelector('#username')
    const passwordInput = sut.querySelector('#password')
    usernameInput.value = username
    passwordInput.value = password
  }

  const submitForm = sut => {
    const form = sut.querySelector('#login-form')
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  }

  describe('input validation', () => {
    let sut = null

    beforeEach(() => {
      sut = createSut()
    })

    it('Should show error message when username is empty', async () => {
      fillForm(sut, '', 'password')
      submitForm(sut)

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.eql('block')
      expect(errorMessage.textContent).to.include('Please enter both username and password')
    })

    it('Should show error message when password is empty', async () => {
      fillForm(sut, 'username', '')
      submitForm(sut)

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.eql('block')
      expect(errorMessage.textContent).to.include('Please enter both username and password')
    })

    it('Should show error message when both username and password are empty', async () => {
      fillForm(sut, '', '')
      submitForm(sut)

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.eql('block')
      expect(errorMessage.textContent).to.include('Please enter both username and password')
    })

    it('Should disable login button and show loading state during login', async () => {
      fillForm(sut, 'testuser', 'testpass')

      // Set up a promise that won't resolve immediately
      authenticateUserStub.callsFake(tick)

      submitForm(sut)

      const loginButton = sut.querySelector('#login-button')
      expect(loginButton.disabled).to.be.true
      expect(loginButton.textContent).to.eql('Logging in...')
    })
  })

  describe('with validToken', () => {
    const exampleUserInfoFromToken = { email: exampleEmail, ['cognito:username']: 'FromToken' }
    const exampleSessionDetails = {
      accessToken: 'access-token',
      idToken: 'part0.part1.signature',
      refreshToken: 'refresh-token',
    }
    let sut
    const exampleSession = createFakeSession(exampleSessionDetails)

    beforeEach(() => {
      sut = createSut()
      fillForm(sut, 'testuser', 'testpass')

      authenticateUserStub.callsFake((authDetails, callbacks) => {
        callbacks.onSuccess(exampleSession)
      })
      decodesIdTokenStub.returns(exampleUserInfoFromToken)
    })

    it('Should save tokens to storage on successful login', async () => {
      submitForm(sut)

      expect(authStorageStubs.saveTokens.calledOnce).to.be.true
      const savedTokens = authStorageStubs.saveTokens.firstCall.args[0]
      expect(savedTokens.accessToken).to.eql(exampleSessionDetails.accessToken)
      expect(savedTokens.idToken).to.eql(exampleSessionDetails.idToken)
      expect(savedTokens.refreshToken).to.eql(exampleSessionDetails.refreshToken)
      expect(savedTokens.userInfo).to.eql({
        username: exampleUserInfoFromToken['cognito:username'],
        email: exampleUserInfoFromToken.email,
      })
    })

    it('Should dispatch cfb-login-success event on successful login', async () => {
      let loginSuccessEvent = null
      sut.addEventListener('cfb-login-success', e => {
        loginSuccessEvent = e
      })

      submitForm(sut)

      await tick()
      expect(loginSuccessEvent.detail.userInfo.username).to.eql(exampleUserInfoFromToken['cognito:username'])
    })

    it('if cognito:username is missing, takes from sub', async () => {
      const withMissingCognitoUsername = { email: 'test@rinkkasatiainen.dev', sub: 'a.s' }
      decodesIdTokenStub.returns(withMissingCognitoUsername)

      submitForm(sut)

      const savedTokens = authStorageStubs.saveTokens.firstCall.args[0]
      expect(savedTokens.userInfo.username).to.eql('a.s')
    })
  })

  describe('when changing password is required', () => {
    let sut
    const exampleUserInfoFromToken = { email: exampleEmail, ['cognito:username']: 'FromToken' }

    beforeEach(() => {
      sut = createSut()
      fillForm(sut, 'testuser', 'testpass')

      authenticateUserStub.callsFake((authDetails, callbacks) => {
        callbacks.newPasswordRequired({ email: exampleEmail })
      })
      decodesIdTokenStub.returns(exampleUserInfoFromToken)
    })

    it('Should redirect to change password page when new password is required', async () => {
      submitForm(sut)

      expect(redirectToSpy.calledOnce).to.be.true
      const callArgs = redirectToSpy.firstCall.args
      expect(callArgs).to.eql(['/change-password.html?mode=new-password-required'])
    })

    it('Should store temporary username in sessionStorage when new password is required', async () => {
      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(sessionStorage.getItem('cfb-temp-username')).to.eql('testuser')
      expect(sessionStorage.getItem('cfb-temp-email')).to.eql(exampleUserInfoFromToken.email)
    })
  })

  describe('error cases', () => {
    let sut
    const err = { message: 'Incorrect username or password.' }

    beforeEach(() => {
      sut = createSut()
      fillForm(sut, 'testuser', 'testpass')

      authenticateUserStub.callsFake((authDetails, callbacks) => {
        callbacks.onFailure(err)
      })
    })

    it('Should show error message on authentication failure', async () => {
      submitForm(sut)

      await tick()

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.eql('block')
      expect(errorMessage.textContent).to.include('Incorrect username or password')
    })

    it('Should dispatch cfb-login-error event on authentication failure', async () => {
      let loginErrorEvent = null
      sut.addEventListener('cfb-login-error', e => {
        loginErrorEvent = e
      })

      submitForm(sut)

      await tick()

      expect(loginErrorEvent).to.not.be.null
      expect(loginErrorEvent.detail.error).to.eql(err)
    })

    it('Should re-enable login button after failed login', async () => {
      submitForm(sut)

      await tick()

      const loginButton = sut.querySelector('#login-button')
      expect(loginButton.disabled).to.be.false
      expect(loginButton.textContent).to.eql('Login')
    })

    it('Should escape HTML in error messages', async () => {
      authenticateUserStub.callsFake((authDetails, callbacks) => {
        callbacks.onFailure({ message: '<script>alert("xss")</script>Error message' })
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 50))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.textContent).to.include('<script>alert("xss")</script>Error message')
      // The HTML should be escaped in the textContent, not interpreted
      expect(errorMessage.innerHTML).to.not.include('<script>')
    })
  })
})
