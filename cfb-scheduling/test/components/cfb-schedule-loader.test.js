import {expect} from 'chai'
import {CfbScheduleLoader} from '../../src/components/cfb-schedule-loader.js'
import * as sinon from 'sinon'
import cfbStorage from '../../src/ports/cfb-schedule-storage.js'
import {CfbRetrievesSchedules} from '../../src/ports/cfb-retrieves-schedules.js'

const untilNotNull = async asyncCallback => {
  const startTime = Date.now()
  const timeout = 1000 // 1 second timeout

  while (Date.now() - startTime < timeout) {
    const result = await asyncCallback()
    if (result !== null) {
      return result
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  throw new Error('Timed out waiting for non-null result')
}

const noop = () => { /* noop */ }

const todo = testName => {
  xit(testName, noop)
}

describe('CfbScheduleLoader', () => {
  let testRoot = null
  let element
  let getScheduleSectionsStub
  let eventId

  before(async () => {
    customElements.define(CfbScheduleLoader.elementName, CfbScheduleLoader)
    await cfbStorage.init()
  })

  beforeEach(async () => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-testRoot'
    document.body.appendChild(testRoot)
    getScheduleSectionsStub = sinon.stub()
    CfbRetrievesSchedules.getScheduleSections = getScheduleSectionsStub
    element = document.createElement('cfb-schedule-loader')
    testRoot.appendChild(element)
    eventId = crypto.randomUUID()
  })
  
  afterEach(async () => {
    await emptyStorage(eventId)
  })

  it('should store empty schedules when none are retrieved', async () => {
    getScheduleSectionsStub.resolves([])
    
    element.setAttribute(CfbScheduleLoader.definedAttributes.eventId, eventId)

    expect(cfbStorage.getAllSections('test-event-1')).to.be.empty
  })

  it('should store schedule sections in storage when event ID changes', async () => {
    testRoot.appendChild(element)
    const sections = [
      { id: 'section-1', name: 'Section 1', order: 0 },
      { id: 'section-2', name: 'Section 2', order: 1 },
    ]
    getScheduleSectionsStub.resolves(sections)

    element.setAttribute(CfbScheduleLoader.definedAttributes.eventId, eventId)
    await tick()

    const storedSections = await cfbStorage.getAllSections(eventId)
    expect(storedSections).to.deep.equal(sections)
  })

  todo('do some testing here.')
})
async function emptyStorage(eventId) {
  const sections = await cfbStorage.getAllSections(eventId)
  await Promise.all(sections.map(section => cfbStorage.deleteSection(eventId, section.id)))
}

async function tick(ms = 0) {
  await new Promise(resolve => setTimeout(resolve, ms)) // Allow async operations to complete
}
