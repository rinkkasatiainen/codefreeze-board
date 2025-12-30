const cfbRoot = '/api'

class CfbRetrievesItems {
  async getItems(eventId) {
    if(!eventId){
      return []
    }
    try {
      const response = await fetch(`${cfbRoot}/event/${eventId}/items`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.items || []
    } catch {
      // Fallback to default items for now
      return []
    }
  }
}

export default new CfbRetrievesItems()

