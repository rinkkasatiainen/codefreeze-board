import {InputLogger} from '../domain/input-logger.js'

// =============================================================================
// Domain Logic - Dependency Injection for withStream
// =============================================================================

const STREAM_ID = 'last-input-logger'
const CAPABILITY = 'cfb-npm-template'

export const logLatestInput = withStream => async input =>
  await withStream(STREAM_ID, {capability: CAPABILITY}).do(async stream => {
    // Replay events to build current entity state
    const entity = await stream.replay(InputLogger.eventHandlers, InputLogger.empty())

    // Pure domain logic - generate new events
    const events = InputLogger.logInput(entity, input)

    // Append events to stream (in-memory)
    stream.appendEvents(events)

    // Persist all appended events
    await stream.save()

    return {eventCount: events.length, entity}
  })
