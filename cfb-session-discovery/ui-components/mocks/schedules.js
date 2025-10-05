import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'
import {codefreeze2025} from '../../contracts/section-entry.js'

export const devApi = 'https://cfb.rinkkasatiainen.dev/api'
const scheduleMocks = (eventId, examples = {}) => {
  const defaultData = {'/sections': codefreeze2025}
  const data = {...defaultData, ...examples}

  const url = devApi + `/event/${eventId}/sections`

  return [
    http.get(url, async () =>
      // Mock successful response
      HttpResponse.json({
        sections: data['/sections'] || [],
      }),
    ),
  ]
}

export function setupMocks(eventId, examples = {}) {
  const defaultData = {'/sections': codefreeze2025}

  const data = {...defaultData, ...examples}

  return setupWorker(
    ...scheduleMocks(eventId, data),
  )
}
