import { expect, use } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { createTestLogger, tick } from '@rinkkasatiainen/cfb-testing-utils'
import authStorage from '../../src/lib/authenticated-user.js'
import { CfbAuthStatus } from '../../src/components/cfb-auth-status.js'
import { startTestWorker, withAuthenticatedUser, withLogout } from '../../fakes/auth-mocks.js'
import { redirectToSpy } from '../fakes/redirect-to.js'

use(sinonChai)

const todo = it.skip

describe('CfbAuthStatus', () => {
  let testRoot = null
  let logger
  let worker

  before(async () => {
    customElements.define(CfbAuthStatus.elementName, CfbAuthStatus)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    worker = startTestWorker()
    await worker.start({ quiet: true })
  })

  beforeEach(async () => {
    document.body.appendChild(testRoot)
    await authStorage.init()
    redirectToSpy.resetHistory()
    logger = createTestLogger()
  })

  afterEach(() => {
    testRoot.innerHTML = ''
    worker.resetHandlers()
    sinon.restore()
  })

  after(async () => {
    await worker.stop()
  })

  const createSut = () => {
    const sut = document.createElement(CfbAuthStatus.elementName)
    testRoot.appendChild(sut)
    return sut
  }

  describe('when authenticated', () => {
    let sut

    beforeEach(() => {
      withAuthenticatedUser(true, { username: 'testuser', email: 'test@example.com' })
      withLogout()
    })

    it('Should render logged-in status with username when user is authenticated', async () => {
      sut = createSut()
      await tick()

      expect(sut.innerHTML).to.include('Logged in as:')
      expect(sut.innerHTML).to.include('testuser')
    })

    it('Should escape HTML in username display', async () => {
      worker.resetHandlers()
      withAuthenticatedUser(true, {
        username: '<script>alert("xss")</script>user',
        email: 'a@example.com',
      })
      withLogout()

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

      sut.querySelector('#logout-button').click()
      await tick()

      expect(eventListenerSpy).to.have.been.calledOnce
    })

    it('Should clear tokens on logout', async () => {
      sut = createSut()
      await tick()

      sut.querySelector('#logout-button').click()
      await tick()

      expect(redirectToSpy).to.have.been.calledOnceWith('/api/auth/logout')
    })
  })

  describe('when not authenticated', () => {
    let sut

    beforeEach(async () => {
      withAuthenticatedUser(false, {})
      sut = createSut()
      await tick()
    })

    it('Should render login link when user is not authenticated', async () => {
      expect(sut.innerHTML).to.include('>Sign in</a>')
    })
  })

  describe('when token is expired - not necessary responsibility of this', () => {
    beforeEach(() => {
      withAuthenticatedUser(true, { username: 'testuser', email: 'test@example.com' })
    })

    todo('should clear tokens on render if token is expired', async () => {
      // This should be implemented somehow. Please fix
    })
  })

  describe('login/logout behavior', () => {
    let sut

    beforeEach(async () => {
      withAuthenticatedUser(true, { username: 'testuser', email: 'test@example.com' })
      withLogout()

      sut = createSut()
      await tick()
    })

    it('Should dispatch cfb-logout-success event on logout', async () => {
      let logoutEvent = null
      sut.addEventListener('cfb-logout-success', e => {
        logoutEvent = e
      })

      sut.querySelector('#logout-button').click()
      await tick()

      expect(logoutEvent).to.not.be.null
    })

    todo('Should re-check authentication status when login success event is received')
  })

  it('Should handle logout errors gracefully', async () => {
    withAuthenticatedUser(true, { username: 'testuser', email: 'test@example.com' })
    withLogout({ fail: true })

    const sut = createSut()
    await tick()

    logger.expect.error(() => true)
    expect(() => sut.querySelector('#logout-button').click()).to.not.throw()
    await tick()
  })
})
