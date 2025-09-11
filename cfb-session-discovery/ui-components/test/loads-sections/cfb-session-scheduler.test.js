import {expect} from 'chai'
import {createTestLogger, tick, waitUntil} from '@rinkkasatiainen/cfb-testing-utils'
import {CfbSessionScheduler} from '../../src/loads-sections/components/cfb-session-scheduler.js'
import {ensureSingle} from '../test-helpers.js'
import cfbScheduleStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import {stub} from 'sinon'
import {exampleSessionEntry} from '../../contracts/session-entry.js'
import {Times} from '@rinkkasatiainen/cfb-testing-utils/dist/src/test-logger.js'
import {mockSessionWith} from './cfb-section-models.js'

const noop = () => { /* noop */
}
const todo = testName => {
  // eslint-disable-next-line mocha/no-pending-tests
  xit(testName, noop)
}

describe('CfbSessionScheduler', () => {
  let testRoot = null
  const testEventId = 'test-event-1' + crypto.randomUUID()

  before(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    customElements.define(CfbSessionScheduler.elementName, CfbSessionScheduler)
  })

  beforeEach(() => {
    cfbScheduleStorage.getAllSessionsForSection = stub().resolves([])
    document.body.appendChild(testRoot)
  })

  afterEach(async () => {
    cfbScheduleStorage.getAllSessionsForSection.reset()
    document.querySelectorAll('#test-root').forEach(el => el.innerHTML = '')
  })

  const createSut = (attributes = {}) => {
    const attrs = {
      sectionId: exampleSessionEntry.sectionId,
      eventId: testEventId,
      updatedAt: '1234567890', ...attributes,
    }
    const sut = document.createElement(CfbSessionScheduler.elementName)

    const sectionId = attrs.sectionId
    if (sectionId) {
      sut.setAttribute(CfbSessionScheduler.definedAttributes.sectionId, sectionId)
    }
    if (attrs.eventId) {
      sut.setAttribute(CfbSessionScheduler.definedAttributes.eventId, attributes.eventId)
    }
    if (attrs.updatedAt) {
      sut.setAttribute(CfbSessionScheduler.definedAttributes.updatedAt, attributes.updatedAt)
    }
    sut.innerHTML = `<cfb-section data-section-id="${sectionId}"><section></section></cfb-section>`
    testRoot.appendChild(sut)

    sut.getSessions = () => Array.from(sut.querySelectorAll('cfb-session'))
    sut.whenNoOfSessionsIs = expected => () => sut.getSessions().length === expected

    return sut
  }

  describe('render', () => {
    it('Should render sessions when all required attributes are set', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut()

      await waitUntil(sut.whenNoOfSessionsIs(1), 200)

      // Just check that the component is created and has the right structure
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-scheduler')
      expect(sut.getSessions().length).to.eql(1)
    })

    it('Should not render sessions when section-id is missing', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut({
        sectionId: undefined,
      })
      await tick(10)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-scheduler')
      expect(sut.getSessions().length).to.eql(0)
    })

    it('Should not render sessions when event-id is missing', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut({
        eventId: undefined,
      })

      await tick(10)
      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-scheduler')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(0)
    })

    it('Should not render sessions when updated-at is missing', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut({
        updatedAt: undefined,
      })

      await tick(10)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-scheduler')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(0)
    })

    const randomSessionForSection = () => mockSessionWith({sectionId: exampleSessionEntry.sectionId})

    it('Should clear existing sessions before adding new ones', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([randomSessionForSection()])
      const sut = createSut({sectionId: exampleSessionEntry.sectionId})
      await waitUntil(sut.whenNoOfSessionsIs(1), 100)

      // Update the updatedAt attribute to trigger re-render
      cfbScheduleStorage.getAllSessionsForSection.resolves([randomSessionForSection(), randomSessionForSection()])
      sut.setAttribute(CfbSessionScheduler.definedAttributes.updatedAt, 'now')
      await waitUntil(sut.whenNoOfSessionsIs(2), 100)

      const finalSessionCount = sut.getSessions().length
      expect(finalSessionCount).to.equal(2)
    })
  })

  describe('html structure', () => {
    it('Should create session elements with correct HTML structure', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut()

      await waitUntil(sut.whenNoOfSessionsIs(1))

      // Check that the component creates the basic structure
      const sessionElement = ensureSingle(sut.querySelectorAll('cfb-session'))
      expect(sessionElement.getAttribute('data-session-id')).to.equal(exampleSessionEntry.id)
      expect(sessionElement.children[0].tagName.toLowerCase()).to.equal('article')
      const article = ensureSingle(sessionElement.querySelectorAll('article'))
      const header = ensureSingle(article.querySelectorAll('header'))
      expect(header.innerHTML).to.contain(`<span class="cfb-card__title">${exampleSessionEntry.name}</span>`)
    })

    it('Should handle session data with tags correctly', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut()

      await waitUntil(sut.whenNoOfSessionsIs(1))

      // Check that the component creates the basic structure
      const tagContainer = ensureSingle(sut.querySelectorAll('.cfb-card__tags'))
      const tags = Array.from(tagContainer.querySelectorAll('.cfb-tag'))
      expect(tags.map(x => x.innerHTML)).to.eql(exampleSessionEntry.tags.map(x => x.name))
      expect(tags.map(x => x.className)).to.eql(exampleSessionEntry.tags.map(x => `cfb-tag cfb-tag--${x.type}`))
    })

    it('Should handle session data with speakers correctly', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut()

      await waitUntil(sut.whenNoOfSessionsIs(1))

      // Check that the component creates the basic structure
      const footer = ensureSingle(sut.querySelectorAll('footer'))
      const speakers = Array.from(footer.querySelectorAll('.cfb-avatar'))
      expect(speakers.map(x => x.innerHTML)).to.eql(exampleSessionEntry.speakers.map(x => x.initials))
    })
  })

  describe('corner cases', () => {
    it('should not add sessions to wrong sessionId', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut({sectionId: 'wrong-section-id'})
      await tick() // event loop

      expect(sut.getSessions().length).to.eql(0)
    })

    it('Should handle empty sessions array', async () => {
      cfbScheduleStorage.getAllSessionsForSection.resolves([exampleSessionEntry])
      const sut = createSut()
      await waitUntil(sut.whenNoOfSessionsIs(1))

      // set to return empty array, force rerender
      cfbScheduleStorage.getAllSessionsForSection.resolves([])
      sut.setAttribute(CfbSessionScheduler.definedAttributes.updatedAt, 'now')
      await waitUntil(sut.whenNoOfSessionsIs(0))

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-scheduler')
      expect(sut.getSessions().length).to.eql(0)
    })

    it('Should handle fetch errors gracefully', async () => {
      cfbScheduleStorage.getAllSessionsForSection.rejects(new Error('Network error'))
      const logger = createTestLogger()
      logger.expect.error('Error fetching sessions', Times.once)
      const sut = createSut()
      await tick()

      // Check that component is created but no sessions are rendered due to error
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-scheduler')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(0)
    })

    it('Should update sessions when data-updated-at changes', async () => {
      const sut = createSut()
      await tick()

      // Verify initial session
      expect(sut.getSessions().length).to.eql(0)

      // Update the updatedAt attribute to trigger re-render
      const session2 = {...exampleSessionEntry, id: 'session-2'}
      cfbScheduleStorage.getAllSessionsForSection.resolves([session2])
      sut.setAttribute(CfbSessionScheduler.definedAttributes.updatedAt, '1234567891')

      await waitUntil(sut.whenNoOfSessionsIs(1), 200)

      // Verify updated session
      expect(sut.getSessions().length).to.eql(1)
      expect(sut.getSessions()[0].getAttribute('data-session-id')).to.equal('session-2')
    })

    it('Should update sessions when data-section-id changes', async () => {
      const sut = createSut({sectionId: exampleSessionEntry.sectionId})
      sut.innerHTML += '<cfb-section data-section-id="section-2"><section></section></cfb-section>'
      await tick() // JS event loop to trigger promises

      expect(sut.getSessions().length).to.eql(0)

      // Update the sectionId attribute to trigger re-render
      cfbScheduleStorage.getAllSessionsForSection
        .resolves([{...exampleSessionEntry, id: 'session-2', sectionId: 'section-2'}])
      sut.setAttribute(CfbSessionScheduler.definedAttributes.sectionId, 'section-2')

      // Wait for the attribute change to trigger re-render
      await waitUntil(sut.whenNoOfSessionsIs(1), 200)

      // Verify updated session
      expect(sut.getSessions().length).to.eql(1)
      expect(sut.getSessions()[0].getAttribute('data-session-id')).to.equal('session-2')
    })

    it('Should update sessions when data-event-id changes', async () => {
      const sut = createSut({eventID: exampleSessionEntry.eventId})
      await tick() // JS event loop to trigger promises

      expect(sut.getSessions().length).to.eql(0)

      // Update the eventId attribute to trigger re-render
      const session2 = {...exampleSessionEntry, eventId: 'event-id-2', id: 'session-2'}
      cfbScheduleStorage.getAllSessionsForSection.resolves([session2])
      sut.setAttribute(CfbSessionScheduler.definedAttributes.eventId, 'event-id-2')

      // Wait for the attribute change to trigger re-render
      await waitUntil(sut.whenNoOfSessionsIs(1), 200)

      // Verify updated session
      expect(sut.getSessions().length).to.eql(1)
      expect(sut.getSessions()[0].getAttribute('data-session-id')).to.equal('session-2')
    })
  })

  todo('Given 2 sessions, when one of them is missing data, then should render only the one that has all data')
})
