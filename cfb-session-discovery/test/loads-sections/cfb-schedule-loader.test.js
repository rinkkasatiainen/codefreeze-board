import {expect} from 'chai'
import {CfbScheduleLoader} from '../../src/loads-sections/components/cfb-schedule-loader.js'
import * as sinon from 'sinon'
import cfbStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import CfbRetrievesSchedules from '../../src/loads-sections/ports/cfb-retrieves-schedules.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'
import {Times} from '@rinkkasatiainen/cfb-testing-utils/dist/src/test-logger.js'
import {withSection} from './cfb-section-models.js'
import {EventTypes, isSectionsLoaded} from '../../src/events/events-loaded.js'
import {waitUntil} from '@rinkkasatiainen/cfb-testing-utils'

const untilNotNull = async (asyncFn, predicate = x => x !== null) => {
  const startTime = Date.now()
  const timeout = 1000 // 1 second timeout

  while (Date.now() - startTime < timeout) {
    const result = await asyncFn()
    if (predicate(result)) {
      return result
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  throw new Error('Timed out waiting for non-null result')
}

describe('CfbScheduleLoader', () => {
  let testRoot = null
  let element
  let getScheduleSectionsStub
  let eventId
  let testFailLogger = null

  before(async () => {
    customElements.define(CfbScheduleLoader.elementName, CfbScheduleLoader)
    testRoot = document.createElement('div')
    testRoot.id = 'test-testRoot'
    await cfbStorage.init()
  })

  beforeEach(async () => {
    testFailLogger = createLogger()
    testFailLogger.expect.warn(true, Times.once)
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
    await tick()

    expect(cfbStorage.getAllSections('test-event-1')).to.be.empty
  })

  it('should store schedule sections in storage when event ID changes', async () => {
    const sections = [
      withSection({order: 0}),
    ]
    getScheduleSectionsStub.resolves(sections)

    // testFailLogger.expect.warn(true, Times.once)
    element.setAttribute(CfbScheduleLoader.definedAttributes.eventId, eventId)
    await tick()

    const storedSections = await untilNotNull(() => cfbStorage.getAllSections(eventId), x => x.length > 0)
    expect(storedSections).to.deep.equal(sections)
  })

  it('should update data-last-updated-at for all children', async () => {
    const child1 = document.createElement('div')
    child1.classList.add('listens-session-updates')
    const child2 = document.createElement('div')
    child2.classList.add('listens-session-updates')
    element.appendChild(child1)
    element.appendChild(child2)

    const sections = [
      withSection({order: 0}), withSection({order: 1}),
    ]
    getScheduleSectionsStub.resolves(sections)

    element.setAttribute(CfbScheduleLoader.definedAttributes.eventId, eventId)
    await tick()

    const timestamp = child1.getAttribute('data-updated-at')
    expect(timestamp).to.not.be.null
    expect(child2.getAttribute('data-updated-at')).to.equal(timestamp)
  })

  it('dispatches event for schedule loaded', async () => {
    let called = false
    const listener = event => {
      if(isSectionsLoaded(event)) {
        called = true
      }
    }
    testRoot.addEventListener(EventTypes.SECTIONS_LOADED, listener)

    getScheduleSectionsStub.resolves([withSection()])

    element.setAttribute(CfbScheduleLoader.definedAttributes.eventId, eventId)
    await waitUntil(() => called, 200)
    testRoot.removeEventListener(EventTypes.SECTIONS_LOADED, listener)
  })
})

async function tick(timeoutInMs = 100) {
  return new Promise(resolve => {
    setTimeout( resolve, timeoutInMs)
  })
}

async function emptyStorage(eventId) {
  const sections = await cfbStorage.getAllSections(eventId)
  await Promise.all(sections.map(section => cfbStorage.deleteSection(eventId, section.id)))
}
