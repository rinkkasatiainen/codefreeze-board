import { expect,use  } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { authorizedFetch } from '../../src/ports/authorized-fetch.js'

use(sinonChai)

describe('authorizedFetch', () => {
  afterEach(() => {
    sinon.restore()
  })

  // TODO: Test this using MSW instead!

  it('calls /api with credentials include', async () => {
    const fetchStub = sinon.stub(globalThis, 'fetch').resolves({ status: 200 })
    await authorizedFetch('/event/x/sections')
    expect(fetchStub).to.have.been.calledOnce
    const [url, options] = fetchStub.firstCall.args
    expect(url).to.equal('/api/event/x/sections')
    expect(options.credentials).to.equal('include')
  })

  it('dispatches cfb-auth-failed on 401', async () => {
    sinon.stub(globalThis, 'fetch').resolves({ status: 401 })
    const events = []
    window.addEventListener('cfb-auth-failed', () => events.push(true))
    await authorizedFetch('/api/event/x/sections')
    expect(events).to.have.length(1)
  })
})
