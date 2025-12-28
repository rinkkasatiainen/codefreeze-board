import {AssertionError} from 'chai'

function isArray(value) {
  return Array.isArray(value)
}

export const withClearableStorage = storage => {
  storage.clearAll = async function(eventId) {
    const sections = [...await this.getAllSections(eventId)]
    // Also clear sessions if the storage has session methods
    const deleteSessions = []
    if (this.getAllSessions) {
      for (const section of sections) {
        const sessions = await this.getAllSessions(eventId, section.id)
        const sessionDeletePromises = sessions.map(session => this.deleteSession(eventId, session.id))
        deleteSessions.push(...sessionDeletePromises)
      }
    }

    const examples = [...sections]
    const deletePromises = examples.map(example => this.deleteSection(eventId, example.id))
    await Promise.all([...deletePromises, ...deleteSessions])

    delete storage.clearAll
  }
  return storage
}

export function ensureSingle(arr, predicate = () => true) {
  const elements = arr instanceof NodeList ? Array.from(arr) : arr
  if (!(isArray(elements) && elements.length === 1)) {
    throw new AssertionError('Expected array to have exactly one element, but got: ' + elements.join(', '))
  }
  if (elements.filter(predicate).length !== 1) {
    throw new AssertionError('expected the single element to match predicate')
  }
  return elements[0]
}
