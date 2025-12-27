import CfbRetrievesSchedules from '../../src/loads-sections/ports/cfb-retrieves-schedules.js'
import * as chai from 'chai'
import {expect} from 'chai'
import {startTestWorker, withSections, withSessions} from '../../mocks/schedules_mocks.js'
import {schemaMatcher} from '@rinkkasatiainen/cfb-testing-utils'
import {sectionSchema, sessionSchema} from '../_contracts/section-schema.js'
import {mockSessionWith, withSection} from '../loads-sections/cfb-section-models.js'

chai.use(schemaMatcher)

describe('Session Data Contract', () => {
  let worker

  before(async () => {
    worker = startTestWorker() // withSections(testEventId, {'/sections': contract}, {})
    await worker.start({quiet: true})
  })

  after(async () => {
    await worker.stop()
  })

  describe('builders', () => {
    it('sessionBuilder', () => {
      const session = mockSessionWith()

      expect(session).to.matchSchema(sessionSchema)
    })

    it('sectionBuilder', () => {
      const session = withSection()

      expect(session).to.matchSchema(sectionSchema)
    })
  })

  describe('session-loader', () => {
    let contract
    const testEventId = 'test-event-123'

    before(async () => {
      const response = await fetch('test/_contracts/codefreeze2025-sessions.json', {})
      contract = await response.json()
    })

    beforeEach(() => {
      withSessions(testEventId, {'/sessions': contract}, {})
    })

    afterEach(async () => {
      worker.resetHandlers()
    })

    it('should retrieve schedule sessions successfully', async () => {
      const sessions = await CfbRetrievesSchedules.getScheduleSessions(testEventId)

      expect(sessions).to.be.an('array')
      expect(sessions).to.have.lengthOf(2)
      expect(sessions[0].id).to.eql( 'ecea7799-2a69-4b05-86f5-5113f3428382')

      sessions.forEach(section => {
        expect(section).to.matchSchema(sessionSchema)
      })
    })
  })

  describe('retrieves sections', () => {
    const testEventId = 'test-event-123'
    let contract

    before(async () => {
      const response = await fetch('test/_contracts/codefreeze2025-sections.json', {})
      contract = await response.json()
    })

    beforeEach(async () => {
      withSections(testEventId, {'/sections': contract}, {})
    })

    afterEach(async () => {
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
