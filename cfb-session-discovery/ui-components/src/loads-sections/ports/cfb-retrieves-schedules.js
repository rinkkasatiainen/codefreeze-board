// TODO: AkS: Fix to take from a json config file
const cfbRoot = 'https://cfb.rinkkasatiainen.dev/api'

class CfbRetrievesSchedules {
  async getScheduleSections(eventId) {
    if(!eventId){
      // TODO: AkS: Add error handling here
      console.warn('No event id provided, returning empty array')
      return []
    }
    try {
      // TODO: AkS: Add user token here later
      const response = await fetch(`${cfbRoot}/event/${eventId}/sections`)

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
    // TODO: test-drive this.
    try {
      // TODO: Add user token here later
      const response = await fetch(`${cfbRoot}/event/${eventId}/sessions`)

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
