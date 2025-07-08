import {expect} from 'chai'
import {CfbSchedule} from '../../src/loads-sections/components/cfb-schedule.js'
import cfbScheduleStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'
import {Times} from '@rinkkasatiainen/cfb-testing-utils/dist/src/test-logger.js'
import {ensureSingle, withClearableStorage} from '../test-helpers.js'
import {withSection} from './cfb-section-models.js'

const waitUntil = async (predicate, timeout = 100) => {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await predicate()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  throw new Error(`Timeout of ${timeout}ms exceeded waiting for predicate to become true`)
}

describe('CfbSchedule', () => {
  let testRoot = null
  let testFailLogger = null

  before(async () => {
    await cfbScheduleStorage.init()

    customElements.define(CfbSchedule.elementName, CfbSchedule)
  })

  beforeEach(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    testFailLogger = createLogger()
    document.body.appendChild(testRoot)
  })

  const eventId = 'test-event'

  afterEach(async () => {
    withClearableStorage(cfbScheduleStorage).clearAll(eventId)
    document.querySelectorAll('#test-root').forEach(el => el.remove())
  })

  it('should render empty when no sections exist', async () => {
    const sut = document.createElement(CfbSchedule.elementName)
    sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
    testRoot.appendChild(sut)

    await waitUntil(() => sut.children.length === 0)
    expect(sut.children.length).to.equal(0)
  })

  it('should render sections when they exist in storage', async () => {
    // Add a test section to storage
    const testSection = withSection()
    await cfbScheduleStorage.addSection(eventId, testSection)

    const sut = document.createElement(CfbSchedule.elementName)
    sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
    testRoot.appendChild(sut)

    await waitUntil(() => sut.querySelectorAll('cfb-section').length > 0)

    const sectionElement = ensureSingle(Array.from(sut.querySelectorAll('cfb-section')))
    expect(sectionElement.getAttribute('data-section-id')).to.equal(testSection.id)
    expect(sectionElement.getAttribute('data-name')).to.equal(testSection.name)
  })

  it('should update when data-updated-at attribute changes', async () => {
    // Add initial sections
    const section1 = withSection({order: 0})
    await cfbScheduleStorage.addSection(eventId, section1)

    const sut = document.createElement(CfbSchedule.elementName)
    sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
    testRoot.appendChild(sut)

    await waitUntil(() => sut.children.length > 0)

    await cfbScheduleStorage.addSection(eventId, withSection({order: 1}))
    sut.setAttribute(CfbSchedule.definedAttributes.updatedAt, Date.now().toString())

    await waitUntil(() => sut.children.length === 2)
    expect(sut.children.length).to.equal(2)
  })

  it('should not update when data-updated-at attribute is the same', async () => {
    const sut = document.createElement(CfbSchedule.elementName)
    sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
    sut.setAttribute(CfbSchedule.definedAttributes.updatedAt, '123')
    testRoot.appendChild(sut)

    await waitUntil(() => sut.children.length >= 0)
    const initialChildrenCount = sut.children.length

    // Set the same attribute value
    sut.setAttribute(CfbSchedule.definedAttributes.updatedAt, '123')

    await waitUntil(() => sut.children.length === initialChildrenCount)
    expect(sut.children.length).to.equal(initialChildrenCount)
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
})
