import { AssertionError, expect } from 'chai'
import sinon, { restore, stub } from 'sinon'
import { createTestLogger, tick } from '@rinkkasatiainen/cfb-testing-utils'
import { CfbAuthStatus } from '../../src/components/cfb-auth-status.js'
import authStorage from '../../src/storage/auth-storage.js'

const todo = it.skip

describe('CfbAuthStatus', () => {
  let testRoot = null
  const authStorageStubs = {}
  let logger

  before(() => {
    customElements.define(CfbAuthStatus.elementName, CfbAuthStatus)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)
    // Reset stubs
    authStorageStubs.isAuthenticated = stub(authStorage, 'isAuthenticated')
    authStorageStubs.getUserInfo = stub(authStorage, 'getUserInfo')
    authStorageStubs.clearTokens = stub(authStorage, 'clearTokens').resolves()
    logger = createTestLogger()
  })

  afterEach(() => {
    testRoot.innerHTML = ''
    restore()
    // TODO: AkS: impelment a reset for logger - to not have many tests that might work on same logger
    // logger.reset()
  })

  const createSut = () => {
    const sut = document.createElement(CfbAuthStatus.elementName)
    testRoot.appendChild(sut)
    return sut
  }

  describe('when authenticated', () => {
    let sut

    beforeEach(async () => {
      authStorageStubs.isAuthenticated.resolves(true)
      authStorageStubs.getUserInfo.resolves({ username: 'testuser', email: 'test@example.com' })
    })

    afterEach(() => {
      authStorageStubs.isAuthenticated.restore()
      authStorageStubs.getUserInfo.restore()
    })

    it('Should render logged-in status with username when user is authenticated', async () => {
      sut = createSut()
      await tick()

      expect(sut.innerHTML).to.include('Logged in as:')
      expect(sut.innerHTML).to.include('testuser')
    })

    it('Should escape HTML in username display', async () => {
      authStorageStubs.getUserInfo.resolves({ username: '<script>alert("xss")</script>user', email: 'a@example.com' })
      sut = createSut()
      await tick()

      const usernameSpan = sut.querySelector('.cfb-auth-status__username')
      expect(usernameSpan.textContent).to.include('<script>alert("xss")</script>user')
      expect(sut.innerHTML).to.not.include('<script>')
    })

    it('Should show logout button when user is authenticated', async () => {
      sut = createSut()
      await tick()

      const logoutButton = sut.querySelector('#logout-button')
      expect(logoutButton).to.not.be.null
      expect(logoutButton.textContent).to.include('Logout')
    })

    it('dispatches event on logout success', async () => {
      sut = createSut()
      await tick()
      const eventListenerSpy = sinon.spy()
      sut.addEventListener('cfb-logout-success', eventListenerSpy)

      const logoutButton = sut.querySelector('#logout-button')
      logoutButton.click()
      await tick()

      expect(eventListenerSpy.calledOnce).to.be.true
    })

    it('Should clear tokens on logout', async () => {
      sut = createSut()
      await tick()

      const logoutButton = sut.querySelector('#logout-button')
      logoutButton.click()

      await tick()

      expect(authStorageStubs.clearTokens.calledOnce).to.be.true
    })
  })

  describe('when not authenticated', () => {
    let sut

    beforeEach(async () => {
      authStorageStubs.isAuthenticated.resolves(false)
      authStorageStubs.getUserInfo.callsFake(() => {
        throw new AssertionError('this should not have been called')
      })

      sut = createSut()
      await tick()
    })

    it('Should render login link when user is not authenticated', async () => {

      expect(sut.innerHTML).to.include('<a href="/login">login</a>')
    })

    it('Should update display when cfb-login-success event is received', async () => {
      expect(sut.innerHTML).to.include('<a href="/login">login</a>')

      // Simulate login success
      authStorageStubs.isAuthenticated.resolves(true)
      authStorageStubs.getUserInfo.resolves({ username: 'testuser', email: 'test@example.com' })

      window.dispatchEvent(new CustomEvent('cfb-login-success'))

      await tick()

      // Should now show logged in status
      expect(sut.innerHTML).to.include('Logged in as:')
      expect(sut.innerHTML).to.include('testuser')
    })

  })

  describe('when token is expired - not necessary responsibility of this', () => {
    beforeEach(async () => {
      authStorageStubs.isAuthenticated.resolves(true)
      authStorageStubs.getUserInfo.resolves({ username: 'testuser', email: 'test@example.com' })
    })

    todo('should clear tokens on render if token is expired', async () => {
      // This should be implemented somehow. Please fix
    })
  })

  describe('login/logout behavior', () => {
    let sut

    beforeEach(async () => {
      authStorageStubs.isAuthenticated.resolves(true)
      authStorageStubs.getUserInfo.resolves({ username: 'testuser', email: 'test@example.com' })

      sut = createSut()
      await tick()
    })

    it('Should dispatch cfb-logout-success event on logout', async () => {
      let logoutEvent = null
      sut.addEventListener('cfb-logout-success', e => {
        logoutEvent = e
      })

      const logoutButton = sut.querySelector('#logout-button')
      logoutButton.click()

      await tick()

      expect(logoutEvent).to.not.be.null
    })


    it('Should re-check authentication status when login success event is received', async () => {
      // Reset call count
      authStorageStubs.isAuthenticated.resetHistory()
      authStorageStubs.getUserInfo.resetHistory()

      // Simulate login success
      authStorageStubs.isAuthenticated.resolves(true)
      authStorageStubs.getUserInfo.resolves({ username: 'testuser', email: 'test@example.com' })

      window.dispatchEvent(new CustomEvent('cfb-login-success'))

      await tick()

      // Should have checked auth status again
      expect(authStorageStubs.isAuthenticated.called).to.be.true
      expect(authStorageStubs.getUserInfo.called).to.be.true
    })
  })

  it('Should handle logout errors gracefully', async () => {
    authStorageStubs.isAuthenticated.resolves(true)
    authStorageStubs.getUserInfo.resolves({ username: 'testuser', email: 'test@example.com' })
    authStorageStubs.clearTokens.rejects(new Error('Storage error'))

    const sut = createSut()

    await tick()
    logger.expect.error(() => true)
    const logoutButton = sut.querySelector('#logout-button')
    expect(() => logoutButton.click()).to.not.throw()
  })
})
