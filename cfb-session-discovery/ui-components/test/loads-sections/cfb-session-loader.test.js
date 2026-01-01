import { expect } from 'chai'
import { stub } from 'sinon'
import { createLogger } from '@rinkkasatiainen/cfb-observability'
import { Times } from '@rinkkasatiainen/cfb-testing-utils/dist/src/test-logger.js'
import { todo, waitUntil } from '@rinkkasatiainen/cfb-testing-utils'
import { buildSessionWith } from '@rinkkasatiainen/cfb-session-discovery-contracts'

import CfbRetrievesSchedules from '../../src/loads-sections/ports/cfb-retrieves-schedules.js'
import cfbStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import { CfbSessionLoader } from '../../src/loads-sections/components/cfb-session-loader.js'
import { EventTypes, isSessionsLoaded } from '../../src/events/events-loaded.js'
import { CfbScheduleLoader } from '../../src/loads-sections/components/cfb-schedule-loader.js'

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

describe('CfbSessionLoader', () => {
  let testRoot = null
  let element
  let getScheduleSessionsStub
  let eventId
  let testFailLogger = null

  before(async () => {
    customElements.define(CfbSessionLoader.elementName, CfbSessionLoader)
    testRoot = document.createElement('div')
    testRoot.id = 'test-testRoot'
    await cfbStorage.init()
  })

  beforeEach(async () => {
    testFailLogger = createLogger()
    testFailLogger.expect.warn(true, Times.once)
    document.body.appendChild(testRoot)
    getScheduleSessionsStub = stub()
    getScheduleSessionsStub.resolves([])
    CfbRetrievesSchedules.getScheduleSessions = getScheduleSessionsStub
    element = document.createElement('cfb-session-loader')
    testRoot.appendChild(element)
    eventId = crypto.randomUUID()
  })

  afterEach(async () => {
    await emptyStorage(eventId)
  })

  describe('behavior', () => {
    it('should listen to \'data-update-at\'', async () => {
      element.setAttribute(CfbSessionLoader.definedAttributes.eventId, eventId)
      await tick()

      const sessions = [buildSessionWith()]
      getScheduleSessionsStub.resolves(sessions)
      // update listens-to-schedule-updates
      element.setAttribute(CfbSessionLoader.definedAttributes.updatedAt, Date.now().toString())
      await tick()

      const storedSessions = await untilNotNull(() => cfbStorage.getAllSessionsForEvent(eventId), x => x.length > 0)
      expect(storedSessions).to.deep.equal(sessions)
    })

    it('should store empty sessions when none are retrieved', async () => {
      getScheduleSessionsStub.resolves([])

      element.setAttribute(CfbSessionLoader.definedAttributes.eventId, eventId)
      await tick()

      expect(cfbStorage.getAllSessionsForEvent(eventId)).to.be.empty
    })

    it('should store session data in storage when event ID changes', async () => {
      const sessions = [
        buildSessionWith({ order: 0 }),
      ]
      getScheduleSessionsStub.resolves(sessions)

      element.setAttribute(CfbSessionLoader.definedAttributes.eventId, eventId)
      await tick()

      const storedSessions = await untilNotNull(() => cfbStorage.getAllSessionsForEvent(eventId), x => x.length > 0)
      expect(storedSessions).to.deep.equal(sessions)
    })

    it('should update data-updated-at for all children with listens-schedule-updates class', async () => {
      const child1 = document.createElement('div')
      child1.classList.add('listens-schedule-updates')
      const child2 = document.createElement('div')
      child2.classList.add('listens-schedule-updates')
      element.appendChild(child1)
      element.appendChild(child2)

      const sessions = [
        buildSessionWith({ order: 0 }), buildSessionWith({ order: 1 }),
      ]
      getScheduleSessionsStub.resolves(sessions)

      element.setAttribute(CfbSessionLoader.definedAttributes.eventId, eventId)
      await tick()

      const timestamp = child1.getAttribute('data-updated-at')
      expect(timestamp).to.not.be.null
      expect(child2.getAttribute('data-updated-at')).to.equal(timestamp)
    })

    it('should not update children that do not have listens-schedule-updates class', async () => {
      const child2 = document.createElement('div')
      element.appendChild(child2)

      const sessions = [
        buildSessionWith({ order: 0 }),
      ]
      getScheduleSessionsStub.resolves(sessions)

      element.setAttribute(CfbSessionLoader.definedAttributes.eventId, eventId)
      await tick()

      expect(child2.getAttribute('data-updated-at')).to.be.null
    })

    it('should update all children with same timestamp', async () => {
      const child1 = document.createElement('div')
      child1.classList.add('listens-schedule-updates')
      const child2 = document.createElement('div')
      child2.classList.add('listens-schedule-updates')
      const child3 = document.createElement('div')
      child3.classList.add('listens-schedule-updates')
      element.appendChild(child1)
      element.appendChild(child2)
      element.appendChild(child3)

      const sessions = [
        buildSessionWith({ order: 0 }), buildSessionWith({ order: 1 }),
      ]
      getScheduleSessionsStub.resolves(sessions)

      element.setAttribute(CfbSessionLoader.definedAttributes.eventId, eventId)
      await tick()

      const timestamp1 = child1.getAttribute('data-updated-at')
      const timestamp2 = child2.getAttribute('data-updated-at')
      const timestamp3 = child3.getAttribute('data-updated-at')

      expect(timestamp1).to.equal(timestamp2)
      expect(timestamp2).to.equal(timestamp3)
      expect(timestamp1).to.not.be.null
    })

    it('dispatches event for schedule loaded', async () => {
      let called = false
      const listener = event => {
        if(isSessionsLoaded(event)) {
          called = true
        }
      }
      testRoot.addEventListener(EventTypes.SESSIONS_LOADED, listener)

      getScheduleSessionsStub.resolves([buildSessionWith({ order: 0 })])

      element.setAttribute(CfbScheduleLoader.definedAttributes.eventId, eventId)
      await waitUntil(() => called, 200)
      testRoot.removeEventListener(EventTypes.SESSIONS_LOADED, listener)
    })
  })

  describe('corner cases', () => {
    todo('Should handle empty sessions gracefully')
    todo('Should not update children when no sessions are changed?')
    todo('Should store sessions with correct event ID in storage')
  })

  describe('tests for the actual loader of HTML data', () => {
    todo('Should handle malformed session data gracefully')
    todo('Should log errors when session retrieval fails')
  })
})

async function tick(timeoutInMs = 100) {
  return new Promise(resolve => {
    setTimeout(resolve, timeoutInMs)
  })
}

async function emptyStorage(eventId) {
  const sections = await cfbStorage.getAllSections(eventId)
  await Promise.all(sections.map(section => cfbStorage.deleteSection(eventId, section.id)))
}
