import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'

const testWorker = setupWorker(...[])

export const devApi = 'https://cfb.rinkkasatiainen.dev/api'
const scheduleMocks = resourceName => (eventId, examples = {}) => {
  const data = examples

  const url = devApi + `/event/${eventId}/${resourceName}`

  return [
    http.get(url, async () =>
      HttpResponse.json({
        [resourceName]: data[`/${resourceName}`] || [],
      }),
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
