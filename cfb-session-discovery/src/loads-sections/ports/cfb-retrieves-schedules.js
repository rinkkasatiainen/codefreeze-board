class CfbRetrievesSchedules {
  async getScheduleSections(eventId) {
    try {
      const response = await fetch('/schedules', {
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
      return [
        { name: 'Monday', id: '8f47c2a1-9b5d-4e0c-a2b3-c4d5e6f7g8h9', order: 0 },
        { name: 'Tuesday', id: '2c3d4e5f-6g7h-8i9j-k1l2-m3n4o5p6q7r', order: 1 },
        { name: 'Wednesday', id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5', order: 2 },
        { name: 'Thursday', id: 'p6q7r8s9-t0u1-v2w3-x4y5-z6a7b8c9d0', order: 3 },
        { name: 'Friday', id: 'e5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9', order: 4 },
        { name: 'Saturday', id: 't0u1v2w3-x4y5-z6a7-b8c9-d0e1f2g3h4', order: 5 },
        { name: 'Sunday', id: 'i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3', order: 6 },
      ]
    }
  }

  async getScheduleSessions(eventId) {
    // TODO: test-drive this.
    try {
      const response = await fetch('/sessions', {
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
      return [
        {
          id: 'session-1',
          name: 'Example Session',
          description: 'This is an example session',
          sectionId: '8f47c2a1-9b5d-4e0c-a2b3-c4d5e6f7g8h9',
          order: 0,
          tags: [{name: 'Workshop', type: 'blue'}],
          speakers: [{name: 'John Doe', initial: 'JD'}],
        },
        {
          id: 'session-2',
          name: 'Another Session',
          description: 'This is another example session',
          sectionId: '2c3d4e5f-6g7h-8i9j-k1l2-m3n4o5p6q7r',
          order: 1,
          tags: [{name: 'Technical', type: 'green'}],
          speakers: [{name: 'Jane Smith', initial: 'JS'}],
        },
      ]
    }
  }
}

export default new CfbRetrievesSchedules()
