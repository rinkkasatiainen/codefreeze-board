import { expect } from 'chai'
import { createLogger, LOG_LEVELS } from '@rinkkasatiainen/cfb-observability'
import { todo } from '@rinkkasatiainen/cfb-testing-utils'
import { buildSectionWith, buildSessionWith } from '@rinkkasatiainen/cfb-session-discovery-contracts'

import cfbStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import { withClearableStorage } from '../test-helpers.js'

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
      const section = buildSectionWith({ id: 'test-1' })
      await cfbStorage.addSection(testEventId, section)

      const retrieved = await cfbStorage.getSection(testEventId, 'test-1')
      expect(retrieved).to.deep.equal(section)
    })

    it('should get all sections', async () => {
      const sections = [
        buildSectionWith({ id: 'test-4', name: 'Section 2', order: 1 }),
        buildSectionWith({ id: 'test-3', name: 'Section 1', order: 0 }),
      ]

      await Promise.all(sections.map(section => cfbStorage.addSection(testEventId, section)))

      const retrieved = await cfbStorage.getAllSections(testEventId)
      expect(retrieved).to.have.lengthOf(2)
      expect(retrieved.map(s => s.id)).to.have.members(['test-3', 'test-4'])
    })

    it('should delete a section', async () => {
      const section = buildSectionWith({ id: 'test-5' })
      await cfbStorage.addSection(testEventId, section)

      await cfbStorage.deleteSection(testEventId, 'test-5')

      const retrieved = await cfbStorage.getSection(testEventId, 'test-5')
      expect(retrieved).to.be.undefined
    })

    it('should reorder sections', async () => {
      const sections = [
        buildSectionWith({ id: 'test-6', name: 'Section 1', order: 0 }),
        buildSectionWith({ id: 'test-7', name: 'Section 2', order: 1 }),
      ]

      await Promise.all(sections.map(section => cfbStorage.addSection(testEventId, section)))

      // Reverse the order
      const reordered = [...sections].reverse()
      await cfbStorage.reorderSections(testEventId, reordered)

      const retrieved = (await cfbStorage.getAllSections(testEventId))// .sort((a, b) => a.order - b.order)
      expect(retrieved[0].id).to.equal('test-7')
      expect(retrieved[0].order).to.equal(0)
      expect(retrieved[1].id).to.equal('test-6')
      expect(retrieved[1].order).to.equal(1)
    })
  })

  describe('sessions', () => {
    describe('basic flow for finding all sessions', () => {
      it('Should add and retrieve a session', async () => {
        const session = buildSessionWith()

        await cfbStorage.addSession(testEventId, session)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessions).to.have.lengthOf(1)
        expect(sessions[0]).to.deep.equal(session)
      })

      it('Should get all sessions for a specific event and section', async () => {
        const session1 = buildSessionWith()
        const session2 = buildSessionWith({ sectionId: session1.sectionId, order: session1.order + 1 })

        await cfbStorage.addSession(testEventId, session1)
        await cfbStorage.addSession(testEventId, session2)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session1.sectionId)
        expect(sessions).to.have.lengthOf(2)
        expect(sessions.map(s => s.id)).to.have.members([session1.id, session2.id])
      })

      it('Should return empty array when no sessions exist for event and section', async () => {
        const sessions = (await cfbStorage.getAllSessionsForEvent(crypto.randomUUID()))
        expect(sessions).to.be.an('array').that.is.empty
      })

      it('Should delete a session by eventId and sessionId', async () => {
        const session = buildSessionWith({ id: '1', sectionId: 'not-used' })
        await cfbStorage.addSession(testEventId, session)

        // Verify session exists
        const sessionsBefore = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessionsBefore).to.have.lengthOf(1)

        // Delete the session
        await cfbStorage.deleteSession(testEventId, session.id)

        // Verify session is deleted
        const sessionsAfter = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessionsAfter).to.eql([])
      })

      it('Should handle multiple sessions in same section', async () => {
        const sessionWith = buildSessionWith()
        const sessions = [
          sessionWith,
          buildSessionWith({ sectionId: sessionWith.sectionId, order: sessionWith.order + 1 }),
          buildSessionWith({ sectionId: sessionWith.sectionId, order: sessionWith.order + 2 }),
        ]

        await Promise.all(sessions.map(session => cfbStorage.addSession(testEventId, session)))

        const retrievedSessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === sessionWith.sectionId)
        retrievedSessions.sort((a, b) => a.order - b.order)
        expect(retrievedSessions).to.have.lengthOf(3)
        expect(retrievedSessions.map(s => s.id)).to.eql(sessions.map(s => s.id))
      })

      it('Should handle sessions across different sections', async () => {
        const session1 = buildSessionWith({
          sectionId: 'section-a',
          order: 0,
        })

        const session2 = buildSessionWith({
          sectionId: 'section-b',
          order: 0,
        })

        await cfbStorage.addSession(testEventId, session1)
        await cfbStorage.addSession(testEventId, session2)

        const sessionsA = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === 'section-a')
        const sessionsB = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === 'section-b')

        expect(sessionsA).to.have.lengthOf(1)
        expect(sessionsB).to.have.lengthOf(1)
        expect(sessionsA[0].id).to.equal(session1.id)
        expect(sessionsB[0].id).to.equal(session2.id)
      })

      it('Should handle sessions across different events', async () => {
        const event1 = 'event-1'
        const event2 = 'event-2'

        const session1 = buildSessionWith({
          sectionId: 'section-1',
          order: 0,
        })

        const session2 = buildSessionWith({
          sectionId: 'section-1',
          order: 0,
        })

        await cfbStorage.addSession(event1, session1)
        await cfbStorage.addSession(event2, session2)

        const sessionsEvent1 = await cfbStorage.getAllSessionsForSection(event1, 'section-1')
        const sessionsEvent2 = await cfbStorage.getAllSessionsForSection(event2, 'section-1')

        expect(sessionsEvent1).to.have.lengthOf(1)
        expect(sessionsEvent2).to.have.lengthOf(1)
        expect(sessionsEvent1[0].id).to.equal(session1.id)
        expect(sessionsEvent2[0].id).to.equal(session2.id)
      })
    })

    describe('basic flow', () => {
      it('Should add and retrieve a session', async () => {
        const session = buildSessionWith()

        await cfbStorage.addSession(testEventId, session)

        const sessions = await cfbStorage.getAllSessionsForSection(testEventId, session.sectionId)
        expect(sessions).to.have.lengthOf(1)
        expect(sessions[0]).to.deep.equal(session)
      })

      it('Should get all sessions for a specific event and section', async () => {
        const session1 = buildSessionWith()
        const session2 = buildSessionWith({ sectionId: session1.sectionId, order: session1.order + 1 })

        await cfbStorage.addSession(testEventId, session1)
        await cfbStorage.addSession(testEventId, session2)

        const sessions = await cfbStorage.getAllSessionsForSection(testEventId, session1.sectionId)
        expect(sessions).to.have.lengthOf(2)
        expect(sessions.map(s => s.id)).to.have.members([session1.id, session2.id])
      })

      it('Should return empty array when no sessions exist for event and section', async () => {
        const sessions = await cfbStorage.getAllSessionsForSection(testEventId, 'non-existent-section')
        expect(sessions).to.be.an('array').that.is.empty
      })

      it('Should delete a session by eventId and sessionId', async () => {
        const session = buildSessionWith({ id: '1', sectionId: 'not-used' })
        await cfbStorage.addSession(testEventId, session)

        // Verify session exists
        const sessionsBefore = await cfbStorage.getAllSessionsForSection(testEventId, session.sectionId)
        expect(sessionsBefore).to.have.lengthOf(1)

        // Delete the session
        await cfbStorage.deleteSession(testEventId, session.id)

        // Verify session is deleted
        const sessionsAfter = await cfbStorage.getAllSessionsForSection(testEventId, session.sectionId)
        expect(sessionsAfter).to.eql([])
      })

      it('Should handle multiple sessions in same section', async () => {
        const sessionWith = buildSessionWith()
        const sessions = [
          sessionWith,
          buildSessionWith({ sectionId: sessionWith.sectionId, order: sessionWith.order + 1 }),
          buildSessionWith({ sectionId: sessionWith.sectionId, order: sessionWith.order + 2 }),
        ]

        await Promise.all(sessions.map(session => cfbStorage.addSession(testEventId, session)))

        const retrievedSessions = await cfbStorage.getAllSessionsForSection(testEventId, sessionWith.sectionId)
        retrievedSessions.sort((a, b) => a.order - b.order)
        expect(retrievedSessions).to.have.lengthOf(3)
        expect(retrievedSessions.map(s => s.id)).to.eql(sessions.map(s => s.id))
      })

      it('Should handle sessions across different sections', async () => {
        const session1 = buildSessionWith({
          sectionId: 'section-a',
          order: 0,
        })
        const session2 = buildSessionWith({
          sectionId: 'section-b',
          order: 0,
        })
        const eventId = crypto.randomUUID()

        await cfbStorage.addSession(eventId, session1)
        await cfbStorage.addSession(eventId, session2)

        const sessionsA = await cfbStorage.getAllSessionsForSection(eventId, 'section-a')
        const sessionsB = await cfbStorage.getAllSessionsForSection(eventId, 'section-b')

        expect(sessionsA).to.have.lengthOf(1)
        expect(sessionsB).to.have.lengthOf(1)
        expect(sessionsA[0].id).to.equal(session1.id)
        expect(sessionsB[0].id).to.equal(session2.id)
      })

      it('Should handle sessions across different events', async () => {
        const event1 = 'event-10'
        const event2 = 'event-11'

        const session1 = buildSessionWith({
          sectionId: 'section-1',
          order: 0,
        })

        const session2 = buildSessionWith({
          sectionId: 'section-1',
          order: 0,
        })

        await cfbStorage.addSession(event1, session1)
        await cfbStorage.addSession(event2, session2)

        const sessionsEvent1 = await cfbStorage.getAllSessionsForSection(event1, 'section-1')
        const sessionsEvent2 = await cfbStorage.getAllSessionsForSection(event2, 'section-1')

        expect(sessionsEvent1).to.have.lengthOf(1)
        expect(sessionsEvent2).to.have.lengthOf(1)
        expect(sessionsEvent1[0].id).to.equal(session1.id)
        expect(sessionsEvent2[0].id).to.equal(session2.id)
      })
    })

    describe('data', () => {
      it('Should handle session data with tags correctly', async () => {
        const session = buildSessionWith({
          tags: [
            { name: 'Frontend', type: 'blue' },
            { name: 'React', type: 'purple' },
            { name: 'Workshop', type: 'green' },
          ],
        })

        await cfbStorage.addSession(testEventId, session)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessions.map( x=>x.tags)).to.eql([session.tags])
      })

      it('Should handle session data with speakers correctly', async () => {
        const session = buildSessionWith({
          speakers: [
            { name: 'John Doe', initial: 'JD' },
            { name: 'Jane Smith', initials: 'JS' },
            { name: 'Mike Johnson', initial: 'MJ' },
          ],
        })

        await cfbStorage.addSession(testEventId, session)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessions.map( x=>x.speakers)).to.eql([session.speakers])
      })

      it('Should handle session data with order correctly', async () => {
        const session1 = buildSessionWith({ order: 0 })
        const session2 = buildSessionWith({ order: 1, sectionId: session1.sectionId })
        const session3 = buildSessionWith({ order: 2, sectionId: session1.sectionId })

        await cfbStorage.addSession(testEventId, session1)
        await cfbStorage.addSession(testEventId, session2)
        await cfbStorage.addSession(testEventId, session3)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session1.sectionId)
        expect(sessions).to.have.lengthOf(3)

        // Verify order is preserved
        const sortedSessions = sessions.sort((a, b) => a.order - b.order)
        expect(sortedSessions[0].order).to.equal(0)
        expect(sortedSessions[1].order).to.equal(1)
        expect(sortedSessions[2].order).to.equal(2)
      })

      it('Should handle session data with description correctly', async () => {
        const session = buildSessionWith({
          description: `This is a detailed description of the session 
          with multiple lines 
          and special characters: !@#$%^&*()`,
        })

        await cfbStorage.addSession(testEventId, session)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessions).to.have.lengthOf(1)
        expect(sessions[0].description).to.equal(session.description)
      })

      it('Should handle session data with sectionId correctly', async () => {
        const session = buildSessionWith({
          sectionId: 'special-section-id-with-dashes-and-underscores',
        })

        await cfbStorage.addSession(testEventId, session)

        const sessions = (await cfbStorage.getAllSessionsForEvent(testEventId))
          .filter(x => x.sectionId === session.sectionId)
        expect(sessions).to.have.lengthOf(1)
        expect(sessions[0].sectionId).to.equal(session.sectionId)
        expect(sessions[0].sectionId).to.equal('special-section-id-with-dashes-and-underscores')
      })
    })

    describe('validation', () => {
      todo('Should handle database errors when adding session')
      todo('Should handle database errors when getting sessions')
      todo('Should handle database errors when deleting session')
      todo('Should handle session not found when deleting')
    })
  })
})
