import { expect, use } from 'chai'
import { restore, spy, stub } from 'sinon'
import sinonChai from 'sinon-chai'
import { schemaMatcher, tick } from '@rinkkasatiainen/cfb-testing-utils'
import { CfbChangePassword } from '../../src/components/cfb-change-password.js'
import authStorage from '../../src/storage/auth-storage.js'
import { changePasswordStub, completeNewPasswordChallengeStub, createFakeSession } from '../fakes/fake-cognito.js'
import { decodesIdTokenStub } from '../fakes/decodes-id-token.js'
import { tokenSchema } from '../../contracts/schemas/token-schema.js'
import { redirectToSpy } from '../fakes/redirect-to.js'

use(sinonChai)
use(schemaMatcher)

describe('CfbChangePassword', () => {
  let testRoot = null
  const authStorageStubs = {}
  const exampleSessionDetails = {
    accessToken: 'access-token',
    idToken: 'part0.part1.signature',
    refreshToken: 'refresh-token',
  }

  before(() => {
    customElements.define(CfbChangePassword.elementName, CfbChangePassword)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'

    window.CFB_CONFIG = {
      userPoolId: 'test-pool-id',
      clientId: 'test-client-id',
      region: 'eu-north-1',
      rootUrl: 'https://test.example.com',
    }
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)

    authStorageStubs.saveTokens = stub(authStorage, 'saveTokens').resolves()
    authStorageStubs.getTokens = stub(authStorage, 'getTokens').resolves({
      userInfo: { username: 'testuser', email: 'test@example.com' },
    })

    completeNewPasswordChallengeStub.reset()
    changePasswordStub.reset()
    sessionStorage.clear()
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.remove())
    restore()
    sessionStorage.clear()
    redirectToSpy.resetHistory()
  })

  const createSut = (attributes = {}) => {
    const sut = document.createElement(CfbChangePassword.elementName)
    if (attributes['data-mode']) {
      sut.setAttribute('data-mode', attributes['data-mode'])
    }
    testRoot.appendChild(sut)
    return sut
  }

  describe('behavior', () => {

    it('Should render new password required form when data-mode is new-password-required', () => {
      const sut = createSut({ 'data-mode': 'new-password-required' })

      expect(sut.innerHTML).to.include('Set Your Password')
      expect(sut.querySelector('#temp-password')).to.not.be.null
      expect(sut.querySelector('#old-password')).to.be.null
    })

    it('Should update form when data-mode attribute changes', () => {
      const sut = createSut()

      // Initially should show change password form
      expect(sut.innerHTML).to.include('Change Password')
      expect(sut.querySelector('#old-password')).to.not.be.null
      expect(sut.querySelector('#temp-password')).to.be.null

      // Change to new-password-required mode
      sut.setAttribute('data-mode', 'new-password-required')

      // Should update to show new password required form
      expect(sut.innerHTML).to.include('Set Your Password')
      expect(sut.querySelector('#temp-password')).to.not.be.null
      expect(sut.querySelector('#old-password')).to.be.null
    })

    it('Should complete new password challenge successfully', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')
      const sut = createSut({ 'data-mode': 'new-password-required' })

      fillForm(sut, {})

      const fakeSession = createFakeSession(exampleSessionDetails)

      completeNewPasswordChallengeStub.callsFake((newPassword, attributes, callbacks) => {
        callbacks.onSuccess(fakeSession)
      })
      decodesIdTokenStub.returns({
        'email': 'aki@rinkkasatiainen.dev',
        'cognito:username': 'aki-rinkkasatiainen.dev',
      })

      submitForm(sut)
      await tick()

      expect(authStorageStubs.saveTokens).to.have.been.calledOnce

      const args = authStorageStubs.saveTokens.firstCall.args
      expect(args[0]).to.matchSchema(tokenSchema)
    })

    it('Should redirect to index page after new password success', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')
      const sut = createSut({ 'data-mode': 'new-password-required' })
      fillForm(sut)

      const fakeSession = createFakeSession(exampleSessionDetails)

      completeNewPasswordChallengeStub.callsFake((newPassword, attributes, callbacks) => {
        callbacks.onSuccess(fakeSession)
      })

      submitForm(sut)
      await tick()

      expect(redirectToSpy).to.have.been.calledOnce
      expect(redirectToSpy.firstCall.args[0]).to.eql('/index.html')
      expect(redirectToSpy.firstCall.args[1]).to.eql(1500)
    })

    it('Should change password successfully in change mode', async () => {
      const sut = createSut()
      fillForm(sut)
      const eventListenerSpy = spy()
      sut.addEventListener('cfb-password-change-success', eventListenerSpy)

      changePasswordStub.callsFake((oldPassword, newPassword, callback) => {
        callback(null, 'SUCCESS')
      })

      submitForm(sut)
      await tick()

      expect(eventListenerSpy).to.have.been.calledOnce
    })

    it('Should clear form fields after successful password change', async () => {
      const sut = createSut()
      fillForm(sut)

      changePasswordStub.callsFake((oldPassword, newPassword, callback) => {
        callback(null, 'SUCCESS')
      })

      submitForm(sut)
      await tick()

      const oldInput = sut.querySelector('#old-password')
      const newInput = sut.querySelector('#new-password')
      const confirmInput = sut.querySelector('#confirm-password')

      expect(oldInput.value).to.equal('')
      expect(newInput.value).to.equal('')
      expect(confirmInput.value).to.equal('')
    })

    it('Should disable submit button and show loading state during processing', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')
      const fakeSession = createFakeSession(exampleSessionDetails)

      const sut = createSut({ 'data-mode': 'new-password-required' })
      fillForm(sut)

      let resolveChallenge
      completeNewPasswordChallengeStub.callsFake((newPassword, attributes, callbacks) => {
        resolveChallenge = () => callbacks.onSuccess(fakeSession)
      })

      submitForm(sut)

      // sets 'disabled' state
      await tick()
      const submitButton = sut.querySelector('#submit-button')
      expect(submitButton.disabled).to.be.true
      expect(submitButton.textContent).to.equal('Processing...')

      // clears 'disabled' state
      resolveChallenge()
      await tick()
      const btn = sut.querySelector('#submit-button')
      expect(btn.disabled).to.be.false
      expect(btn.textContent).to.equal('Set Password')

    })
  })

  describe('stores to indexDB', () => {
    it('Should save tokens after completing new password challenge', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')
      const sut = createSut({ 'data-mode': 'new-password-required' })
      fillForm(sut)

      const fakeSession = createFakeSession(exampleSessionDetails)

      completeNewPasswordChallengeStub.callsFake((newPassword, attributes, callbacks) => {
        callbacks.onSuccess(fakeSession)
      })

      submitForm(sut)

      await tick()

      expect(authStorageStubs.saveTokens).to.have.been.calledOnce
      const savedTokens = authStorageStubs.saveTokens.firstCall.args[0]
      expect(savedTokens).to.matchSchema(tokenSchema)
    })

    it('Should clear temporary session storage after new password challenge', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')
      sessionStorage.setItem('cfb-temp-email', 'test@example.com')

      const sut = createSut({ 'data-mode': 'new-password-required' })
      fillForm(sut)

      completeNewPasswordChallengeStub.callsFake((newPassword, attributes, callbacks) => {
        callbacks.onSuccess(createFakeSession(exampleSessionDetails))
      })

      submitForm(sut)
      await tick()

      expect(sessionStorage.getItem('cfb-temp-username')).to.be.null
      expect(sessionStorage.getItem('cfb-temp-email')).to.be.null
    })

    it('Should dispatch cfb-password-change-success event on new password success', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')

      const sut = createSut({ 'data-mode': 'new-password-required' })
      fillForm(sut)

      let successEvent = null
      sut.addEventListener('cfb-password-change-success', e => {
        successEvent = e
      })

      completeNewPasswordChallengeStub.callsFake((newPassword, attributes, callbacks) => {
        callbacks.onSuccess(createFakeSession(exampleSessionDetails))
      })

      submitForm(sut)
      await tick()

      expect(successEvent).to.not.be.null
      expect(successEvent.detail.userInfo).to.not.be.undefined
    })
  })

  describe('error cases', () => {
    it('Should show error when temp password is empty in new-password-required mode', async () => {
      sessionStorage.setItem('cfb-temp-username', 'testuser')
      const sut = createSut({ 'data-mode': 'new-password-required' })
      fillForm(sut, {
        tempPassword: '',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 10))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('Please fill in all fields')
    })

    it('Should show error when old password is empty in change mode', async () => {
      const sut = createSut()
      fillForm(sut, {
        oldPassword: '',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 10))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('Please enter your current password')
    })

    it('Should show error when new password is empty', async () => {
      const sut = createSut()
      fillForm(sut, {
        oldPassword: 'oldpass',
        newPassword: '',
        confirmPassword: 'newpass123',
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 10))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('Please fill in all fields')
    })

    it('Should show error when confirm password is empty', async () => {
      const sut = createSut()
      fillForm(sut, {
        oldPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: '',
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 10))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('Please fill in all fields')
    })

    it('Should show error when new passwords do not match', async () => {
      const sut = createSut()
      fillForm(sut, {
        oldPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'differentpass',
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 10))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('New passwords do not match')
    })

    it('Should show error when new password is same as old password in change mode', async () => {
      const sut = createSut()
      fillForm(sut, {
        oldPassword: 'samepass',
        newPassword: 'samepass',
        confirmPassword: 'samepass',
      })

      submitForm(sut)

      await new Promise(resolve => setTimeout(resolve, 10))

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('New password must be different from current password')
    })

    it('Should show error message on password change failure', async () => {
      const sut = createSut()
      fillForm(sut)

      changePasswordStub.callsFake((oldPassword, newPassword, callback) => {
        callback({ message: 'Incorrect password' }, null)
      })

      submitForm(sut)
      await tick()

      const errorMessage = sut.querySelector('#error-message')
      expect(errorMessage.style.display).to.equal('block')
      expect(errorMessage.textContent).to.include('Incorrect password')
    })

    it('Should dispatch cfb-password-change-error event on failure', async () => {
      const sut = createSut()
      fillForm(sut)

      let errorEvent = null
      sut.addEventListener('cfb-password-change-error', e => {
        errorEvent = e
      })

      const error = { message: 'Incorrect password' }
      changePasswordStub.callsFake((oldPassword, newPassword, callback) => {
        callback(error, null)
      })

      submitForm(sut)
      await tick()

      expect(errorEvent).to.not.be.null
      expect(errorEvent.detail.error).to.equal(error)
    })

    it('Should re-enable submit button after failed password change', async () => {
      const sut = createSut()
      fillForm(sut)

      changePasswordStub.callsFake((oldPassword, newPassword, callback) => {
        callback({ message: 'Incorrect password' }, null)
      })

      submitForm(sut)
      await tick()

      const submitButton = sut.querySelector('#submit-button')
      expect(submitButton.disabled).to.be.false
      expect(submitButton.textContent).to.equal('Change Password')
    })
  })

  it('Should escape HTML in error and success messages', async () => {
    const sut = createSut()
    fillForm(sut, {
      oldPassword: 'oldpass',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    })

    changePasswordStub.callsFake((oldPassword, newPassword, callback) => {
      callback({ message: '<script>alert("xss")</script>Error' }, null)
    })

    submitForm(sut)
    await tick()

    const errorMessage = sut.querySelector('#error-message')
    expect(errorMessage.textContent).to.include('<script>alert("xss")</script>Error')
    // HTML should be escaped in textContent, not interpreted
    expect(errorMessage.innerHTML).to.not.include('<script>')
  })
})

const fillForm = (sut, options = {}) => {
  const {
    tempPassword = 'temppass',
    oldPassword = 'oldpass',
    newPassword = 'newpass123',
    confirmPassword = 'newpass123',
  } = options

  if (tempPassword) {
    const tempInput = sut.querySelector('#temp-password')
    if (tempInput) {
      tempInput.value = tempPassword
    }
  }
  if (oldPassword) {
    const oldInput = sut.querySelector('#old-password')
    if (oldInput) {
      oldInput.value = oldPassword
    }
  }
  const newInput = sut.querySelector('#new-password')
  if (newInput) {
    newInput.value = newPassword
  }
  const confirmInput = sut.querySelector('#confirm-password')
  if (confirmInput) {
    confirmInput.value = confirmPassword
  }
}

const submitForm = sut => {
  const form = sut.querySelector('#change-password-form')
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
}

