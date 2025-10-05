// TODO: AkS: Fix to take from a json config file
const cfbRoot = 'https://cfb.rinkkasatiainen.dev/api'

class CfbRetrievesSchedules {
  async getScheduleSections(eventId) {
    try {
      const response = await fetch(`${cfbRoot}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          // TODO: Add user token here later
          // token: userToken
        }),
      })

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
      const response = await fetch(`${cfbRoot}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          // TODO: Add user token here later
          // token: userToken
        }),
      })

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
