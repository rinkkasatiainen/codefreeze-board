import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'

const testWorker = setupWorker(...[])

export const devApi = 'https://cfb.rinkkasatiainen.dev/api'
const scheduleMocks = resourceName => (eventId, examples = {}) => {
  const data = examples

  const url = devApi + `/event/${eventId}/${resourceName}`
  console.log('setting handler for ' + url)

  return [
    http.get(url, async () =>
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
    ),
  ]
}

export function startTestWorker() {
  return testWorker
}

export function withSessions(eventId, examples) {
  const data = {...examples}

  testWorker.use(
    ...scheduleMocks('sessions')(eventId, data),
  )
}

export function withSections(eventId, examples) {
  const data = {...examples}

  testWorker.use(
    ...scheduleMocks('sections')(eventId, data),
  )
}

export function getRegisteredHandlers() {
  return testWorker.listHandlers()
}
