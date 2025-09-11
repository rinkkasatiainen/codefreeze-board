import {setupWorker} from 'msw/browser'
import {http, HttpResponse} from 'msw'
import {codefreeze2025} from '../contracts/section-entry.js'

export const scheduleMocks = (examples = {}) => {
  const defaultData = { '/schedules': codefreeze2025 }
  const data = {...defaultData, ...examples}

  return [
    http.post('/schedules', async ({request}) => {
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
        sections: data['/schedules'] || [],
      })
    }),
  ]
}

export function setupMocks(examples = {}) {
  const defaultData = {'/schedules': codefreeze2025}

  const data = {...defaultData, ...examples}

  return setupWorker(
    ...scheduleMocks(data),
  )
}
