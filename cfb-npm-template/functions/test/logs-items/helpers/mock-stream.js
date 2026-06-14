import {Eventually} from '@rinkkasatiainen/cfb-functional'
import sinon from 'sinon'

const replayFn = existingEvents => async (eventHandlers, initialState) => {
  let state = {...initialState}

  for (const event of existingEvents) {
    const handler = eventHandlers[event.detail.metadata.type]
    if (handler) {
      state = handler(state, event)
    }
  }

  return state
}

/**
 * Creates a mock withStream function for testing actions.
 *
 * @param {Object} options - Configuration options
 * @param {Array} [options.existingEvents=[]] - Events to return during replay
 * @param {Function} [options.onSave] - Callback when save is called
 * @param {Error} [options.saveError] - Error to throw on save
 * @returns {Object} { mockWithStream, spies, appendedEvents, getAppendedEvents, getSavedEvents }
 */
export function createMockWithStream(options = {}) {
  const existingEvents = options.existingEvents || []

  const appendedEventsBuffer = []
  const allAppendedEvents = []
  const savedEvents = []

  const spies = {
    replay: sinon.spy(replayFn(existingEvents)),
    appendEvents: sinon.spy(events => {
      appendedEventsBuffer.push(...events)
      allAppendedEvents.push(...events)
    }),
    save: sinon.spy(async () => {
      if (options.saveError) {
        throw options.saveError
      }
      savedEvents.push(...appendedEventsBuffer)
      appendedEventsBuffer.splice(0, appendedEventsBuffer.length)
      if (options.onSave) {
        options.onSave()
      }
    }),
  }

  const mockStream = {
    replay: spies.replay,
    appendEvents: spies.appendEvents,
    save: spies.save,
  }

  const mockWithStream = (streamId, opts) => ({
    streamId,
    options: opts,
    do: async callback => {
      try {
        const result = await callback(mockStream)
        return Eventually.resolve(result)
      } catch (error) {
        return Eventually.reject(error)
      }
    },
  })

  return {
    mockWithStream,
    spies,
    appendedEvents: allAppendedEvents,
    getAppendedEvents: () => appendedEventsBuffer,
    getSavedEvents: () => savedEvents,
  }
}

/**
 * Creates a stored event in the format returned by stream.replay()
 */
export function createStoredEvent(type, data, metadata = {}) {
  return {
    detail: {
      metadata: {
        id: metadata.id || 'test-stream',
        version: metadata.version || 1,
        timestamp: metadata.timestamp || new Date().toISOString(),
        capability: metadata.capability || 'test-capability',
        type,
      },
      data,
    },
  }
}
