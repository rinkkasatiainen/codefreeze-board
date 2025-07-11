import {expect} from 'chai'
import {CfbSchedule} from '../../src/loads-sections/components/cfb-schedule.js'
import cfbScheduleStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'
import {Times} from '@rinkkasatiainen/cfb-testing-utils/dist/src/test-logger.js'
import {ensureSingle, withClearableStorage} from '../test-helpers.js'
import {withSection} from './cfb-section-models.js'
import {waitUntil} from '@rinkkasatiainen/cfb-testing-utils'

describe('CfbSchedule', () => {
  let testRoot = null
  let testFailLogger = null
  let eventId

  before(async () => {
    await cfbScheduleStorage.init()

    customElements.define(CfbSchedule.elementName, CfbSchedule)
    eventId = 'test-event-schedule-test' + crypto.randomUUID()
  })

  beforeEach(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    testFailLogger = createLogger()
    document.body.appendChild(testRoot)
  })

  afterEach(async () => {
    await withClearableStorage(cfbScheduleStorage).clearAll(eventId)
    document.querySelectorAll('#test-root').forEach(el => el.remove())
  })

  describe('adding sections', () => {

    it('should render empty when no sections exist', async () => {
      const sut = await scheduleWithASection()

      await waitUntil(() => sut.children.length === 0)
      expect(sut.children.length).to.equal(0)
    })

    it('should wrape section with a section loader', async () => {
      // Add a test section to storage
      const testSection = withSection({order: 0})
      const sut = await scheduleWithASection(testSection)

      await waitUntil(sut.whenNoOfSectionsIs(1))

      const sessionLoader = ensureSingle(Array.from(sut.querySelectorAll('cfb-session-loader')))
      expect(sessionLoader.getAttribute('data-section-id')).to.equal(testSection.id)
      const sectionElement = ensureSingle(Array.from(sessionLoader.querySelectorAll('cfb-section')))
      expect(sectionElement.getAttribute('data-name')).to.equal(testSection.name)
    })

    it('should render a single section when one section in storage', async () => {
      // Add a test section to storage
      const testSection = withSection({order: 0})
      const sut = await scheduleWithASection(testSection)

      await waitUntil(sut.whenNoOfSectionsIs(1))

      const sectionElement = ensureSingle(Array.from(sut.getSections()))
      expect(sectionElement.getAttribute('data-section-id')).to.equal(testSection.id)
      expect(sectionElement.getAttribute('data-name')).to.equal(testSection.name)
    })

    it('should update when data-updated-at attribute changes', async () => {
      // Add initial sections
      const section1 = withSection({order: 0})
      const sut = await scheduleWithASection(section1)

      await waitUntil(sut.whenNoOfSectionsIs(1))

      await cfbScheduleStorage.addSection(eventId, withSection({order: 1}))
      sut.setAttribute(CfbSchedule.definedAttributes.updatedAt, Date.now().toString())

      await waitUntil(sut.whenNoOfSectionsIs(2))
      const sections = sut.querySelectorAll('cfb-section')
      expect(sections.length).to.equal(2)
    })

    it('should not update when data-updated-at attribute is the same', async () => {
      const sut = await scheduleWithASection(withSection(), {'data-updated-at': '123'})

      await waitUntil(sut.whenNoOfSectionsIs(1))
      const initialChildrenCount = sut.getSections().length

      // Add a section to DB - rerender would change the
      const section = withSection()
      await cfbScheduleStorage.addSection(eventId, section)
      // Set the same attribute value
      sut.setAttribute(CfbSchedule.definedAttributes.updatedAt, '123')

      await tick(100)
      expect(sut.getSections().length).to.equal(initialChildrenCount)
    })

    it('should handle storage errors gracefully', async () => {
      // Mock the storage to throw an error
      testFailLogger.expect.error(true, Times.once)
      const originalGetAllSections = cfbScheduleStorage.getAllSections
      cfbScheduleStorage.getAllSections = () => Promise.reject(new Error('Storage error'))

      const sut = document.createElement(CfbSchedule.elementName)
      sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
      testRoot.appendChild(sut)

      await waitUntil(() => sut.innerHTML.includes('Error loading schedule'))

      expect(sut.innerHTML).to.include('Error loading schedule')

      // Restore original method
      cfbScheduleStorage.getAllSections = originalGetAllSections
    })

    it('should order sections by order', async () => {
      await cfbScheduleStorage.addSection(eventId, withSection({order: 3, name: 'Section 3'}))
      await cfbScheduleStorage.addSection(eventId, withSection({order: 1, name: 'Section 1'}))
      const section2 = withSection({order: 2, name: 'Section 2'})

      const sut = await scheduleWithASection(section2)
      await waitUntil(sut.whenNoOfSectionsIs(3))

      const sections = Array.from(sut.getSections()).map(el => el.getAttribute('data-name'))

      expect(sections).to.eql(['Section 1', 'Section 2', 'Section 3'])
    })
  })

  async function tick(timeoutInMs = 100) {
    return new Promise(resolve => {
      setTimeout(resolve, timeoutInMs)
    })
  }

  const scheduleWithASection = async (section = withSection(), params = {}) => {
    await cfbScheduleStorage.addSection(eventId, section)

    const sut = document.createElement(CfbSchedule.elementName)
    sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
    Object.entries(params).forEach(([key, value]) => {
      sut.setAttribute(key, value)
    })

    sut.getSections = () => sut.querySelectorAll('cfb-section')
    sut.whenNoOfSectionsIs = expected => () => sut.getSections().length === expected

    testRoot.appendChild(sut)
    return sut
  }
})
