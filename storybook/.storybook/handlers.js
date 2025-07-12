import { http, HttpResponse } from 'msw'
import { exampleSessionEntry, day0Entries, day1Entries } from '../stories/session-discovery/mock-data.js'

// Define your API handlers
export const handlers = [
  // Sessions API
  http.get('/api/sessions/:eventId/:sectionId', ({ params }) => {
    const { eventId, sectionId } = params
    
    // Mock different responses based on section
    if (sectionId === 'day-0') {
      return HttpResponse.json(day0Entries)
    } else if (sectionId === 'day-1') {
      return HttpResponse.json(day1Entries)
    } else {
      return HttpResponse.json([exampleSessionEntry])
    }
  }),

  // Sections API
  http.get('/api/sections/:eventId', ({ params }) => {
    const { eventId } = params
    
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
  http.all('*', ({ request }) => {
    console.warn(`__MSW: Unhandled request to ${request.url}`)
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  })
] 