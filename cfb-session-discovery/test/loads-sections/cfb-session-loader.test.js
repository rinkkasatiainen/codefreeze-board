import {expect} from 'chai'
import {waitUntil} from '@rinkkasatiainen/cfb-testing-utils'
import {CfbSessionLoader} from '../../src/loads-sections/components/cfb-session-loader.js'
import {ensureSingle, withClearableStorage} from '../test-helpers.js'
import cfbScheduleStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import {mockSessionWith} from './cfb-section-models.js'
import {stub} from 'sinon'
import {exampleSessionEntry} from '../../contracts/session-entry.js'

const noop = () => { /* noop */
}
const todo = testName => {

  xit(testName, noop)
}

describe('CfbSessionLoader', () => {
  let testRoot = null
  const testEventId = 'test-event-1' + crypto.randomUUID()
  const testSectionId = 'test-section-1' + crypto.randomUUID()

  before(() => {
    customElements.define(CfbSessionLoader.elementName, CfbSessionLoader)
  })

  beforeEach(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    cfbScheduleStorage.getAllSessions = stub().resolves([])
    document.body.appendChild(testRoot)
  })

  afterEach(async () => {
    cfbScheduleStorage.getAllSessions.reset()
    document.querySelectorAll('#test-root').forEach(el => el.innerHTML = '')
  })

  const createSut = (attributes = {}) => {
    const attrs = {sectionId: testSectionId, eventId: testEventId, updatedAt: '1234567890', ...attributes}
    const sut = document.createElement(CfbSessionLoader.elementName)

    const sectionId = attrs.sectionId
    if (sectionId) {
      sut.setAttribute(CfbSessionLoader.definedAttributes.sectionId, sectionId)
    }
    if (attrs.eventId) {
      sut.setAttribute(CfbSessionLoader.definedAttributes.eventId, attributes.eventId)
    }
    if (attrs.updatedAt) {
      sut.setAttribute(CfbSessionLoader.definedAttributes.updatedAt, attributes.updatedAt)
    }
    sut.innerHTML = `<cfb-section data-section-id="${sectionId}"></cfb-section>`

    return sut
  }

  describe('render', () => {
    it('Should render sessions when all required attributes are set', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut()

      testRoot.appendChild(sut)
      await waitUntil(() => sut.querySelectorAll('cfb-session').length > 0)

      // Just check that the component is created and has the right structure
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(1)
    })

    it('Should not render sessions when section-id is missing', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut({
        sectionId: undefined,
      })

      testRoot.appendChild(sut)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(0)
    })

    it('Should not render sessions when event-id is missing', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut({
        eventId: undefined,
      })

      testRoot.appendChild(sut)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(0)
    })

    it('Should not render sessions when updated-at is missing', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut({
        updatedAt: undefined,
      })

      testRoot.appendChild(sut)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelectorAll('cfb-session').length).to.eql(0)
    })
  })

  describe('html structure', () => {
    it('Should create session elements with correct HTML structure', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut()

      testRoot.appendChild(sut)

      // Wait for any async rendering to complete
      await waitUntil(() => sut.querySelectorAll('cfb-session').length > 0)

      // Check that the component creates the basic structure
      const sessionElement = ensureSingle(sut.querySelectorAll('cfb-session'))
      expect(sessionElement.getAttribute('data-session-id')).to.equal(exampleSessionEntry.id)
      expect(sessionElement.children[0].tagName.toLowerCase()).to.equal('article')
      const article = ensureSingle(sessionElement.querySelectorAll('article'))
      const header = ensureSingle(article.querySelectorAll('header'))
      expect(header.innerHTML).to.contain(`<span class="cfb-card__title">${exampleSessionEntry.name}</span>`)
    })

    it('Should handle session data with tags correctly', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut()

      testRoot.appendChild(sut)

      // Wait for any async rendering to complete
      await waitUntil(() => sut.querySelectorAll('cfb-session').length > 0)

      // Check that the component creates the basic structure
      const tagContainer = ensureSingle(sut.querySelectorAll('.cfb-card__tags'))
      const tags = Array.from(tagContainer.querySelectorAll('.cfb-tag'))
      expect(tags.map(x => x.innerHTML)).to.eql(exampleSessionEntry.tags.map(x => x.name))
      expect(tags.map(x => x.className)).to.eql(exampleSessionEntry.tags.map(x => `cfb-tag cfb-tag--${x.type}`))
    })

    it('Should handle session data with speakers correctly', async () => {
      cfbScheduleStorage.getAllSessions.resolves([exampleSessionEntry])
      const sut = createSut()

      testRoot.appendChild(sut)

      // Wait for any async rendering to complete
      await waitUntil(() => sut.querySelectorAll('cfb-session').length > 0)

      // Check that the component creates the basic structure
      const footer = ensureSingle(sut.querySelectorAll('footer'))
      const speakers = Array.from(footer.querySelectorAll('.cfb-avatar'))
      expect(speakers.map(x => x.innerHTML)).to.eql(exampleSessionEntry.speakers.map(x => x.initials))
    })
  })

  describe('corner cases', () => {
    todo('Should handle empty sessions array')
    todo('Given 2 sessions, when one of them is missing data, then should render only the one that has all data')
    todo('Should handle fetch errors gracefully')
    todo('Should update sessions when data-updated-at changes')
    todo('Should update sessions when data-section-id changes')
    todo('Should update sessions when data-event-id changes')
  })
})
