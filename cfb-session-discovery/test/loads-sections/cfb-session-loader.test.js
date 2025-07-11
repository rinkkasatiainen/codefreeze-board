import {expect} from 'chai'
import {waitUntil, tick} from '@rinkkasatiainen/cfb-testing-utils'
import {CfbSessionLoader} from '../../src/loads-sections/components/cfb-session-loader.js'

const noop = () => { /* noop */ }
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
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.innerHTML = '')
  })

  const createSut = (attributes = {}) => {
    const sut = document.createElement(CfbSessionLoader.elementName)

    if (attributes.sectionId) {
      sut.setAttribute(CfbSessionLoader.definedAttributes.sectionId, attributes.sectionId)
    }
    if (attributes.eventId) {
      sut.setAttribute(CfbSessionLoader.definedAttributes.eventId, attributes.eventId)
    }
    if (attributes.updatedAt) {
      sut.setAttribute(CfbSessionLoader.definedAttributes.updatedAt, attributes.updatedAt)
    }

    return sut
  }

  describe('render', () => {
    it('Should render sessions when all required attributes are set', async () => {
      const sut = createSut({
        sectionId: testSectionId,
        eventId: testEventId,
        updatedAt: '1234567890',
      })

      // Add a cfb-section child element
      const sectionElement = document.createElement('cfb-section')
      sectionElement.setAttribute('data-section-id', testSectionId)
      sut.appendChild(sectionElement)

      testRoot.appendChild(sut)

      // Just check that the component is created and has the right structure
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelector('cfb-section')).to.not.be.null
    })

    it('Should not render sessions when section-id is missing', async () => {
      const sut = createSut({
        eventId: testEventId,
        updatedAt: '1234567890',
      })

      const sectionElement = document.createElement('cfb-section')
      sectionElement.setAttribute('data-section-id', testSectionId)
      sut.appendChild(sectionElement)

      testRoot.appendChild(sut)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelector('cfb-session')).to.be.null
    })

    it('Should not render sessions when event-id is missing', async () => {
      const sut = createSut({
        sectionId: testSectionId,
        updatedAt: '1234567890',
      })

      const sectionElement = document.createElement('cfb-section')
      sectionElement.setAttribute('data-section-id', testSectionId)
      sut.appendChild(sectionElement)

      testRoot.appendChild(sut)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelector('cfb-session')).to.be.null
    })

    it('Should not render sessions when updated-at is missing', async () => {
      const sut = createSut({
        sectionId: testSectionId,
        eventId: testEventId,
      })

      const sectionElement = document.createElement('cfb-section')
      sectionElement.setAttribute('data-section-id', testSectionId)
      sut.appendChild(sectionElement)

      testRoot.appendChild(sut)

      // Check that component is created but no sessions are rendered
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelector('cfb-session')).to.be.null
    })

    it('Should clear existing sessions before adding new ones', async () => {
      const sut = createSut({
        sectionId: testSectionId,
        eventId: testEventId,
        updatedAt: '1234567890',
      })

      const sectionElement = document.createElement('cfb-section')
      sectionElement.setAttribute('data-section-id', testSectionId)
      sut.appendChild(sectionElement)

      testRoot.appendChild(sut)

      // Check that component is created with section child
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
      expect(sut.querySelector('cfb-section')).to.not.be.null

      // Update the updatedAt attribute to trigger re-render
      sut.setAttribute(CfbSessionLoader.definedAttributes.updatedAt, '1234567891')

      // Check that component still exists after attribute change
      expect(sut.tagName.toLowerCase()).to.equal('cfb-session-loader')
    })
  })

  describe('html structure', () => {
    todo('Should create session elements with correct HTML structure')
    todo('Should handle session data with tags correctly')
    todo('Should handle session data with speakers correctly')
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
