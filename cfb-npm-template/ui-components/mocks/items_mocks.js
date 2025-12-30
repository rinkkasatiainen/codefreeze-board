import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'

// Keep testWorker for backward compatibility with tests
const testWorker = setupWorker(...[])

export const devApi = '/api'

// Handler factory functions for use with msw-storybook-addon
const itemsMocks = resourceName => (eventId, examples = {}) => {
  const data = examples
  const url = devApi + `/event/${eventId}/${resourceName}`

  return http.get(url, async () =>
    HttpResponse.json({
      [resourceName]: data || [],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow any origin
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
    ),
  )
}

// For backward compatibility with tests
export function startTestWorker() {
  return testWorker
}

// Handler factory functions for Storybook (returns handlers, doesn't register them)
export function createItemHandlers(eventId, examples) {
  const data = {...examples}
  return [itemsMocks('items')(eventId, data)]
}

// Legacy functions for tests (still use testWorker.use)
export function withItems(eventId, examples) {
  const data = [...examples]
  testWorker.use(
    ...[itemsMocks('items')(eventId, data)],
  )
}

// For tests only
export function getRegisteredHandlers() {
  return testWorker.listHandlers()
}

