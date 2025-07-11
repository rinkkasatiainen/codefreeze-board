import {expect} from 'chai'
import cfbStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import {createLogger, LOG_LEVELS} from '@rinkkasatiainen/cfb-observability'
import {withClearableStorage} from '../test-helpers.js'
import {mockSessionWith} from './cfb-section-models.js'

describe('CFBStorage', () => {
  let failTestlogger
  let testEventId

  before(async () => {
    failTestlogger = createLogger()
    failTestlogger.setMinLevel(LOG_LEVELS.ERROR)
    await cfbStorage.init()
  })

  beforeEach(async () => {
    testEventId = 'test-event-id'
  })

  afterEach(async () => {
    withClearableStorage(cfbStorage).clearAll(testEventId)
  })

  describe('adding sections', () => {

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

  describe('sessions', () => {
    const noop = () => { /* noop */
    }
    const todo = testName => {

      xit(testName, noop)
    }

    describe('basic flow', () => {
      it('Should add and retrieve a session', async () => {
        const session = mockSessionWith()

        await cfbStorage.addSession(testEventId, session)

        const sessions = await cfbStorage.getAllSessions(testEventId, session.sectionId)
        expect(sessions).to.have.lengthOf(1)
        expect(sessions[0]).to.deep.equal(session)
      })

      it('Should get all sessions for a specific event and section', async () => {
        const session1 = mockSessionWith()
        const session2 = mockSessionWith({sectionId: session1.sectionId, order: session1.order + 1})

        await cfbStorage.addSession(testEventId, session1)
        await cfbStorage.addSession(testEventId, session2)

        const sessions = await cfbStorage.getAllSessions(testEventId, session1.sectionId)
        expect(sessions).to.have.lengthOf(2)
        expect(sessions.map(s => s.id)).to.have.members([session1.id, session2.id])
      })

      it('Should return empty array when no sessions exist for event and section', async () => {
        const sessions = await cfbStorage.getAllSessions(testEventId, 'non-existent-section')
        expect(sessions).to.be.an('array').that.is.empty
      })

      it('Should delete a session by eventId and sessionId', async () => {
        const session = mockSessionWith({id: '1', sectionId: 'not-used' })
        await cfbStorage.addSession(testEventId, session)

        // Verify session exists
        const sessionsBefore = await cfbStorage.getAllSessions(testEventId, session.sectionId)
        expect(sessionsBefore).to.have.lengthOf(1)

        // Delete the session
        await cfbStorage.deleteSession(testEventId, session.id)

        // Verify session is deleted
        const sessionsAfter = await cfbStorage.getAllSessions(testEventId, session.sectionId)
        expect(sessionsAfter).to.eql([])
      })

      it('Should handle multiple sessions in same section', async () => {
        const sessionWith = mockSessionWith()
        const sessions = [
          sessionWith,
          mockSessionWith({sectionId: sessionWith.sectionId, order: sessionWith.order + 1}),
          mockSessionWith({sectionId: sessionWith.sectionId, order: sessionWith.order + 2}),
        ]

        await Promise.all(sessions.map(session => cfbStorage.addSession(testEventId, session)))

        const retrievedSessions = await cfbStorage.getAllSessions(testEventId, sessionWith.sectionId)
        retrievedSessions.sort((a, b) => a.order - b.order)
        expect(retrievedSessions).to.have.lengthOf(3)
        expect(retrievedSessions.map(s => s.id)).to.eql(sessions.map(s => s.id))
      })

      it('Should handle sessions across different sections', async () => {
        const session1 = mockSessionWith({
          sectionId: 'section-a',
          order: 0,
        })

        const session2 = mockSessionWith({
          sectionId: 'section-b',
          order: 0,
        })

        await cfbStorage.addSession(testEventId, session1)
        await cfbStorage.addSession(testEventId, session2)

        const sessionsA = await cfbStorage.getAllSessions(testEventId, 'section-a')
        const sessionsB = await cfbStorage.getAllSessions(testEventId, 'section-b')

        expect(sessionsA).to.have.lengthOf(1)
        expect(sessionsB).to.have.lengthOf(1)
        expect(sessionsA[0].id).to.equal(session1.id)
        expect(sessionsB[0].id).to.equal(session2.id)
      })

      it('Should handle sessions across different events', async () => {
        const event1 = 'event-1'
        const event2 = 'event-2'

        const session1 = mockSessionWith({
          sectionId: 'section-1',
          order: 0,
        })

        const session2 = mockSessionWith({
          sectionId: 'section-1',
          order: 0,
        })

        await cfbStorage.addSession(event1, session1)
        await cfbStorage.addSession(event2, session2)

        const sessionsEvent1 = await cfbStorage.getAllSessions(event1, 'section-1')
        const sessionsEvent2 = await cfbStorage.getAllSessions(event2, 'section-1')

        expect(sessionsEvent1).to.have.lengthOf(1)
        expect(sessionsEvent2).to.have.lengthOf(1)
        expect(sessionsEvent1[0].id).to.equal(session1.id)
        expect(sessionsEvent2[0].id).to.equal(session2.id)
      })
    })

    describe('data', () => {
      todo('Should handle session data with tags correctly')
      todo('Should handle session data with speakers correctly')
      todo('Should handle session data with order correctly')
      todo('Should handle session data with description correctly')
      todo('Should handle session data with sectionId correctly')
    })

    describe('validation', () => {
      todo('Should handle database errors when adding session')
      todo('Should handle database errors when getting sessions')
      todo('Should handle database errors when deleting session')
      todo('Should handle session not found when deleting')
    })
  })
})
