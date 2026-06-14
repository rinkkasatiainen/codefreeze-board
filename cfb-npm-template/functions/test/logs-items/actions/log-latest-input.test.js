import { expect, use } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { createMockWithStream, createStoredEvent } from '../helpers/mock-stream.js'
import { logLatestInput } from '../../../src/actions/log-latest-input.js'
import { InputLogger } from '../../../src/domain/input-logger.js'

use(sinonChai)

describe('logLatestInput action', () => {
  afterEach(() => {
    sinon.restore()
  })

  // ==========================================================================
  // Test Case 1: Stream Returns No Events (Empty Aggregate)
  // ==========================================================================
  describe ('when stream has no events', () => {
    it('calls replay with correct handlers and initial state', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('test-input')

      expect(spies.replay).to.have.been.calledOnce
      expect(spies.replay).to.have.been.calledWithExactly(
        InputLogger.eventHandlers,
        InputLogger.empty(),
      )
    })

    it('generates events from empty state', async () => {
      const {mockWithStream, getSavedEvents} = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('test-input')

      const savedEvents = getSavedEvents()
      expect(savedEvents).to.have.length(1)
      expect(savedEvents[0]).to.deep.include({
        type: 'input-logged',
        data: {value: 'test-input'},
      })
    })

    it('no appended events, as all are persisted and saved', async () => {
      const {mockWithStream, getAppendedEvents} = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('test-input')

      expect(getAppendedEvents()).to.eql([])
    })

    it('calls save to persist events', async () => {
      const {mockWithStream, getSavedEvents } = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('test-input')

      expect(getSavedEvents()).to.have.length(1)
    })

    it('returns success with eventCount', async () => {
      const {mockWithStream} = createMockWithStream({
        existingEvents: [],
      })

      const result = await logLatestInput(mockWithStream)('test-input')

      await result.fold(
        error => {
          throw new Error(`Should not fail: ${error.message}`)
        },
        ({eventCount}) => {
          expect(eventCount).to.equal(1)
        },
      )
    })

    it('returns entity with initial state', async () => {
      const {mockWithStream} = createMockWithStream({
        existingEvents: [],
      })

      const result = await logLatestInput(mockWithStream)('test-input')

      await result.fold(
        error => {
          throw new Error(`Should not fail: ${error.message}`)
        },
        ({entity}) => {
          expect(entity.lastInput).to.be.null
          expect(entity.inputCount).to.equal(0)
        },
      )
    })
  })

  // ==========================================================================
  // Test Case 2: Stream Returns Only Unknown Events
  // ==========================================================================
  describe('when stream has only unknown events', () => {
    it('ignores unknown events during replay', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('unknown-event-type', {foo: 'bar'}, {version: 1}),
          createStoredEvent('another-unknown-type', {baz: 'qux'}, {version: 2}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(spies.replay).to.have.been.calledOnce
    })

    it('generates events based on initial state', async () => {
      const {mockWithStream, appendedEvents} = createMockWithStream({
        existingEvents: [
          createStoredEvent('unknown-event-type', {foo: 'bar'}, {version: 1}),
          createStoredEvent('another-unknown-type', {baz: 'qux'}, {version: 2}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(appendedEvents).to.have.length(1)
      expect(appendedEvents[0].type).to.equal('input-logged')
    })

    it('calls save after appending', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('unknown-event-type', {foo: 'bar'}, {version: 1}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(spies.save).to.have.been.calledOnce
    })

    it('returns entity with initial state values', async () => {
      const {mockWithStream} = createMockWithStream({
        existingEvents: [
          createStoredEvent('unknown-event-type', {foo: 'bar'}, {version: 1}),
          createStoredEvent('another-unknown-type', {baz: 'qux'}, {version: 2}),
        ],
      })

      const result = await logLatestInput(mockWithStream)('new-input')

      await result.fold(
        error => {
          throw new Error(`Should not fail: ${error.message}`)
        },
        ({entity}) => {
          expect(entity.lastInput).to.be.null
          expect(entity.inputCount).to.equal(0)
        },
      )
    })
  })

  // ==========================================================================
  // Test Case 3: Stream Returns 1 Known Event
  // ==========================================================================
  describe('when stream has 1 known event', () => {
    it('replays the event to build state', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'previous-input'}, {version: 1}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(spies.replay).to.have.been.calledOnce
    })

    it('appends new event based on replayed state', async () => {
      const {mockWithStream, appendedEvents} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'previous-input'}, {version: 1}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(appendedEvents).to.have.length(1)
      expect(appendedEvents[0]).to.deep.include({
        type: 'input-logged',
        data: {value: 'new-input'},
      })
    })

    it('calls save to persist', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'previous-input'}, {version: 1}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(spies.save).to.have.been.calledOnce
    })

    it('returns entity reflecting state after replay', async () => {
      const {mockWithStream} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'previous-input'}, {version: 1}),
        ],
      })

      const result = await logLatestInput(mockWithStream)('new-input')

      await result.fold(
        error => {
          throw new Error(`Should not fail: ${error.message}`)
        },
        ({entity}) => {
          expect(entity.inputCount).to.equal(1)
          expect(entity.lastInput).to.equal('previous-input')
        },
      )
    })
  })

  // ==========================================================================
  // Test Case 4: Stream Returns 2 Known Events
  // ==========================================================================
  describe('when stream has 2 known events', () => {
    it('replays events in order', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'first-input'}, {version: 1}),
          createStoredEvent('input-logged', {value: 'second-input'}, {version: 2}),
        ],
      })

      await logLatestInput(mockWithStream)('third-input')

      expect(spies.replay).to.have.been.calledOnce
    })

    it('builds cumulative state from all events', async () => {
      const {mockWithStream} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'first-input'}, {version: 1}),
          createStoredEvent('input-logged', {value: 'second-input'}, {version: 2}),
        ],
      })

      const result = await logLatestInput(mockWithStream)('third-input')

      await result.fold(
        error => {
          throw new Error(`Should not fail: ${error.message}`)
        },
        ({entity}) => {
          expect(entity.inputCount).to.equal(2)
          expect(entity.lastInput).to.equal('second-input')
        },
      )
    })

    it('appends new event', async () => {
      const {mockWithStream, appendedEvents} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'first-input'}, {version: 1}),
          createStoredEvent('input-logged', {value: 'second-input'}, {version: 2}),
        ],
      })

      await logLatestInput(mockWithStream)('third-input')

      expect(appendedEvents).to.have.length(1)
      expect(appendedEvents[0]).to.deep.include({
        type: 'input-logged',
        data: {value: 'third-input'},
      })
    })

    it('calls save', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'first-input'}, {version: 1}),
          createStoredEvent('input-logged', {value: 'second-input'}, {version: 2}),
        ],
      })

      await logLatestInput(mockWithStream)('third-input')

      expect(spies.save).to.have.been.calledOnce
    })
  })

  // ==========================================================================
  // Test Case 5: Mixed Known and Unknown Events
  // ==========================================================================
  describe('when stream has mixed known and unknown events', () => {
    it('applies only known events during replay', async () => {
      const {mockWithStream} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'known-1'}, {version: 1}),
          createStoredEvent('some-other-event', {data: 'ignored'}, {version: 2}),
          createStoredEvent('input-logged', {value: 'known-2'}, {version: 3}),
          createStoredEvent('yet-another-unknown', {data: 'also-ignored'}, {version: 4}),
        ],
      })

      const result = await logLatestInput(mockWithStream)('new-input')

      await result.fold(
        error => {
          throw new Error(`Should not fail: ${error.message}`)
        },
        ({entity}) => {
          expect(entity.inputCount).to.equal(2)
          expect(entity.lastInput).to.equal('known-2')
        },
      )
    })

    it('calls save after processing', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [
          createStoredEvent('input-logged', {value: 'known-1'}, {version: 1}),
          createStoredEvent('unknown-type', {data: 'ignored'}, {version: 2}),
        ],
      })

      await logLatestInput(mockWithStream)('new-input')

      expect(spies.save).to.have.been.calledOnce
    })
  })

  // ==========================================================================
  // Verifying Appended Events Structure
  // ==========================================================================
  describe('verifying appended events', () => {
    it('appends events with correct structure', async () => {
      const {mockWithStream, spies, appendedEvents} = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('test-value')

      expect(spies.appendEvents).to.have.been.calledOnce
      expect(spies.appendEvents).to.have.been.calledWith(sinon.match.array)

      const [appendedEvent] = appendedEvents
      expect(appendedEvent).to.have.property('type', 'input-logged')
      expect(appendedEvent).to.have.property('data')
      expect(appendedEvent.data).to.eql({value: 'test-value'})
    })

    it('events have no metadata (domain does not add metadata)', async () => {
      const {mockWithStream, appendedEvents} = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('test-value')

      const [appendedEvent] = appendedEvents
      expect(appendedEvent).to.not.have.property('metadata')
      expect(appendedEvent).to.not.have.property('detail')
    })
  })

  // ==========================================================================
  // Verifying Save Behavior
  // ==========================================================================
  describe('verifying save behavior', () => {
    it('calls save after appending events', async () => {
      const {mockWithStream, spies} = createMockWithStream({
        existingEvents: [],
      })

      await logLatestInput(mockWithStream)('input')

      expect(spies.save).to.have.been.calledOnce
      expect(spies.appendEvents).to.have.been.calledBefore(spies.save)
    })

    it('propagates save errors', async () => {
      const saveError = new Error('Database connection failed')
      const {mockWithStream} = createMockWithStream({
        existingEvents: [],
        saveError,
      })

      const result = await logLatestInput(mockWithStream)('input')

      await result.fold(
        error => {
          expect(error.message).to.equal('Database connection failed')
        },
        () => {
          throw new Error('Should have failed')
        },
      )
    })
  })

  // ==========================================================================
  // Stream Configuration
  // ==========================================================================
  describe('stream configuration', () => {
    it('uses correct stream ID', async () => {
      let capturedStreamId = null
      const mockWithStream = (streamId, opts) => {
        capturedStreamId = streamId
        return {
          do: async callback => {
            const mockStream = {
              replay: async () => ({lastInput: null, inputCount: 0}),
              appendEvents: () => {
              },
              save: async () => {
              },
            }
            const result = await callback(mockStream)
            return {fold: async (_, success) => success(result)}
          },
        }
      }

      await logLatestInput(mockWithStream)('input')

      expect(capturedStreamId).to.equal('last-input-logger')
    })

    it('uses correct capability', async () => {
      let capturedOptions = null
      const mockWithStream = (streamId, opts) => {
        capturedOptions = opts
        return {
          do: async callback => {
            const mockStream = {
              replay: async () => ({lastInput: null, inputCount: 0}),
              appendEvents: () => {
              },
              save: async () => {
              },
            }
            const result = await callback(mockStream)
            return {fold: async (_, success) => success(result)}
          },
        }
      }

      await logLatestInput(mockWithStream)('input')

      expect(capturedOptions).to.eql({capability: 'cfb-npm-template'})
    })
  })
})
