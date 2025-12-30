import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'

// Keep testWorker for backward compatibility with tests
const testWorker = setupWorker(...[])

export const devApi = 'https://cfb.rinkkasatiainen.dev/api'

// Handler factory functions for use with msw-storybook-addon
const scheduleMocks = resourceName => (eventId, examples = {}) => {
  const data = examples
  const url = devApi + `/event/${eventId}/${resourceName}`
  console.log('setting handler for ' + url)

  return http.get(url, async () =>
    HttpResponse.json({
        [resourceName]: data[`/${resourceName}`] || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Allow any origin
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    ),
  )
}

// For backward compatibility with tests
export function startTestWorker() {
  return testWorker
}

// Handler factory functions for Storybook (returns handlers, doesn't register them)
export function createSessionHandlers(eventId, examples) {
  const data = {...examples}
  return [scheduleMocks('sessions')(eventId, data)]
}

export function createSectionHandlers(eventId, examples) {
  const data = {...examples}
  return [scheduleMocks('sections')(eventId, data)]
}

// Legacy functions for tests (still use testWorker.use)
export function withSessions(eventId, examples) {
  const data = {...examples}
  testWorker.use(
    ...[scheduleMocks('sessions')(eventId, data)],
  )
}

export function withSections(eventId, examples) {
  const data = {...examples}
  testWorker.use(
    ...[scheduleMocks('sections')(eventId, data)],
  )
}

// For tests only
export function getRegisteredHandlers() {
  return testWorker.listHandlers()
}
