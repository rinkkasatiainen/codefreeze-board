import {codefreeze2025} from '@rinkkasatiainen/cfb-session-discovery/mocks/contracts/section-entry.js'
import { day1Entries, day0Entries } from '@rinkkasatiainen/cfb-session-discovery/mocks/contracts/session-entry.js'
import {http, HttpResponse} from 'msw'

// Mock data for sessions
const exampleSessionEntry = {
  id: 'session-1',
  title: 'Example Session',
  description: 'This is an example session',
  startTime: '2025-01-20T09:00:00Z',
  endTime: '2025-01-20T10:00:00Z',
  tags: ['Workshop', 'Frontend'],
  attendees: ['John Doe', 'Jane Smith'],
  sectionId: 'day-1',
  eventId: 'codefreeze-2025'
}

// Define your API handlers
export const handlers = [
  // Sessions API
  http.get('/api/sessions/:eventId/:sectionId', ({params}) => {
    const {eventId, sectionId} = params

    // Mock different responses based on section
    if (sectionId === 'day-0') {
      return HttpResponse.json(day0Entries)
    } else if (sectionId === 'day-1') {
      return HttpResponse.json(day1Entries)
    } else {
      return HttpResponse.json([exampleSessionEntry])
    }
  }),

  http.post('/schedules', (req) => {
    console.log(req)
    return HttpResponse.json({sections: codefreeze2025})
  }),
  http.post('/sessions', (req) => {
    console.log(req)
    return HttpResponse.json({sessions: [...day1Entries, ...day0Entries]})
  }),
// Sections API
  http.get('/api/sections/:eventId', ({params}) => {
    const {eventId} = params

    return HttpResponse.json([
      {
        id: 'day-0',
        name: 'Day 0 - Travel',
        order: 0,
        eventId
      },
      {
        id: 'day-1',
        name: 'Day 1 - Activities',
        order: 1,
        eventId
      }
    ])
  }),

  // Default fallback for any unmatched requests
  http.all('*', ({request}) => {
    console.warn(`__MSW: Unhandled request to ${request.url}`)
    return HttpResponse.json({error: 'Not found'}, {status: 404})
  })
] 