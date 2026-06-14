import { expect } from 'chai'

import { startTestWorker, withAuthenticatedUser } from '../../fakes/auth-mocks.js'

describe('authStorage (BFF session)', () => {
  let worker
  let authStorage

  before(async () => {
    worker = startTestWorker()
    await worker.start({ quiet: true })
  })

  after(async () => {
    await worker.stop()
  })

  beforeEach(async () => {
    const mod = await import(`../../src/lib/authenticated-user.js?t=${Date.now()}`)
    authStorage = mod.default
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('reports authenticated when session endpoint returns user', async () => {
    withAuthenticatedUser(true, { username: 'testuser' })

    await authStorage.init()
    expect(await authStorage.isAuthenticated()).to.equal(true)
    expect(await authStorage.getUserInfo()).to.eql({ username: 'testuser' })
  })

  it('reports unauthenticated when session endpoint returns false', async () => {
    withAuthenticatedUser(false, {})

    expect(await authStorage.isAuthenticated()).to.equal(false)
  })
})
