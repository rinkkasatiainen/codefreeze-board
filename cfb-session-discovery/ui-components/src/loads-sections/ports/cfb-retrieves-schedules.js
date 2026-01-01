import { authorizedFetch } from '@rinkkasatiainen/cfb-authorization'
// TODO: AkS: Fix to take from a json config file
const cfbRoot = '/api'

class CfbRetrievesSchedules {
  async getScheduleSections(eventId) {
    if (!eventId) {
      // TODO: AkS: Add error handling here
      return []
    }
    try {
      const response = await authorizedFetch(`${cfbRoot}/event/${eventId}/sections`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.sections || []
    } catch {
      // Fallback to default sections for now
      return []
    }
  }

  async getScheduleSessions(eventId) {
    try {
      const response = await authorizedFetch(`${cfbRoot}/event/${eventId}/sessions`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return data.sessions || []
    } catch {
      // Fallback to default sessions for now
      return []
    }
  }
}

export default new CfbRetrievesSchedules()
