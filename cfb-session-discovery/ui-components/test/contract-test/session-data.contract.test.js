import CfbRetrievesSchedules from '../../src/loads-sections/ports/cfb-retrieves-schedules.js'
import {expect} from 'chai'
import * as chai from 'chai'
import {withSections} from '../../mocks/schedules_mocks.js'
import {schemaMatcher} from '@rinkkasatiainen/cfb-testing-utils'
import {sectionSchema} from '../_contracts/section-schema.js'

chai.use(schemaMatcher)

describe('Session Data Contract', () => {
  describe('session-loader', () => {

  })

  describe('retrieves-schedules', () => {

    let worker
    const testEventId = 'test-event-123'

    before(async () => {
      const response = await fetch('test/_contracts/codefreeze2025-sections.json', {})
      const contract = await response.json()
      worker = withSections(testEventId, {'/sections': contract}, {})
      // Start the worker
      await worker.start({quiet: true})
    })

    after(async () => {
      // Clean up
      await worker.stop()
    })

    beforeEach(async () => {
    })

    afterEach(async () => {
      // Reset handlers after each test
      worker.resetHandlers()
    })

    it('should retrieve schedule sections successfully', async () => {
      const sections = await CfbRetrievesSchedules.getScheduleSections(testEventId)

      expect(sections).to.be.an('array')
      expect(sections).to.have.lengthOf(9)
      expect(sections[0]).to.deep.equal({
        date: '2025-01-11',
        name: 'Saturday',
        id: '00000000-0000-0000-0000-000000000000',
        order: 0,
      })
      // Now you can validate each object against the schema
      sections.forEach(section => {
        expect(section).to.matchSchema(sectionSchema)
      })

    })
  })
})
