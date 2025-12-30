export function getAllSectionsByEventId(storage) {
  storage.getAllSectionsByEvents = function () {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const indexName = 'eventId'
      const index = objectStore.index(indexName)

      index.getAllKeys().onsuccess = (event) => {
        const sectionsByEventId = event.target.result
        console.log('getAllKeys success', sectionsByEventId)
        resolve(sectionsByEventId)
      }
    })
  }
  return storage.getAllSectionsByEvents().then(res =>
    res.reduce((acc, [eventId, sectionId]) => {
      const events = acc[eventId] || []
      events.push(sectionId)
      acc[eventId] = events
      return acc
    }, {}))
}