import {expect} from 'chai'
import cfbStorage from '../../src/ports/cfb-schedule-storage.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'
import {LOG_LEVELS} from '../fakes/test-fail-logger.js'

describe('CFBStorage', () => {
  let failTestlogger
  let testEventId

  before(() => {
    failTestlogger = createLogger()
    failTestlogger.setMinLevel(LOG_LEVELS.INFO)
  })

  beforeEach(async () => {
    await cfbStorage.init()
    testEventId = 'test-event-id'
  })
  
  afterEach(async () => {
    const sections = await cfbStorage.getAllSections(testEventId)
    await Promise.all(sections.map(section => cfbStorage.deleteSection(testEventId, section.id)))
  })

  it('should add and retrieve a section', async () => {
    const section = {id: 'test-1', title: 'Test Section', order: 0}
    await cfbStorage.addSection(testEventId, section)

    const retrieved = await cfbStorage.getSection(testEventId, 'test-1')
    expect(retrieved).to.deep.equal(section)
  })

  it('should get all sections', async () => {
    const sections = [
      {id: 'test-3', title: 'Section 1', order: 0},
      {id: 'test-4', title: 'Section 2', order: 1},
    ]

    await Promise.all(sections.map(section => cfbStorage.addSection(testEventId, section)))

    const retrieved = await cfbStorage.getAllSections(testEventId)
    expect(retrieved).to.have.lengthOf(2)
    expect(retrieved.map(s => s.id)).to.have.members(['test-3', 'test-4'])
  })

  it('should delete a section', async () => {
    const section = {id: 'test-5', title: 'Test Section', order: 0}
    await cfbStorage.addSection(testEventId, section)

    await cfbStorage.deleteSection(testEventId, 'test-5')

    const retrieved = await cfbStorage.getSection(testEventId, 'test-5')
    expect(retrieved).to.be.undefined
  })

  it('should reorder sections', async () => {
    const sections = [
      {id: 'test-6', title: 'Section 1', order: 0},
      {id: 'test-7', title: 'Section 2', order: 1},
    ]

    await Promise.all(sections.map(section => cfbStorage.addSection(testEventId, section)))

    // Reverse the order
    const reordered = [...sections].reverse()
    await cfbStorage.reorderSections(testEventId, reordered)

    const retrieved = (await cfbStorage.getAllSections(testEventId)).sort((a, b) => a.order - b.order)
    expect(retrieved[0].id).to.equal('test-7')
    expect(retrieved[0].order).to.equal(0)
    expect(retrieved[1].id).to.equal('test-6')
    expect(retrieved[1].order).to.equal(1)
  })
})
