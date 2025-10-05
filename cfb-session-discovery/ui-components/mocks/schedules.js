import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'
import {codefreeze2025} from '../../contracts/section-entry.js'

export const devApi = 'https://cfb.rinkkasatiainen.dev/api'
const scheduleMocks = (examples = {}) => {
  const defaultData = { '/sections': codefreeze2025 }
  const data = {...defaultData, ...examples}

  return [
    http.post(devApi+'/sections', async ({request}) => {
      const body = await request.json()

      // Validate request body
      if (!body.eventId) {
        return HttpResponse.json(
          {error: 'eventId is required'},
          {status: 400},
        )
      }

      // Mock successful response
      return HttpResponse.json({
        sections: data['/sections'] || [],
      })
    }),
  ]
}

export function setupMocks(examples = {}) {
  const defaultData = {'/sections': codefreeze2025}

  const data = {...defaultData, ...examples}

  return setupWorker(
    ...scheduleMocks(data),
  )
}
