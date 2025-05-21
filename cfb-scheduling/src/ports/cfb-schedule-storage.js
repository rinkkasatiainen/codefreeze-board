import {createLogger} from '@rinkkasatiainen/cfb-observability'

class CfbScheduleStorage {
  #logger

  constructor() {
    this.#logger = createLogger()
    this.dbName = 'cfb-db'
    this.dbVersion = 1
    this.storeName = 'cfb-sections'
  }

  static #initialized = null

  async init() {
    if (CfbScheduleStorage.#initialized) {
      return Promise.resolve(null)
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = event => {
        this.#logger.warn('Error opening database', {event})
        reject('Error opening database')
      }

      request.onsuccess = event => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: ['eventId', 'id'] })
          store.createIndex('eventId', 'eventId', { unique: false })
          store.createIndex('order', 'order', { unique: false })
        }
      }
    })
  }

  async addSection(eventId, section) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const sectionWithEventId = { ...section, eventId }
      const request = store.add(sectionWithEventId)

      request.onsuccess = () => resolve(section)
      request.onerror = event => {
        this.#logger.warn('Error adding section', {event, section, eventId})
        reject('Error adding section')
      }
    })
  }

  async getSection(eventId, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get([eventId, id])

      request.onsuccess = () => {
        const result = request.result
        if (result) {
          const { eventId: _, ...sectionWithoutEventId } = result
          resolve(sectionWithoutEventId)
        } else {
          resolve(undefined)
        }
      }
      request.onerror = event => {
        this.#logger.warn('Error getting section', {event, id, eventId})
        reject('Error getting section')
      }
    })
  }

  async getAllSections(eventId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('eventId')
      const request = index.getAll(IDBKeyRange.only(eventId))

      request.onsuccess = () => {
        const sections = request.result.map(({ eventId: _, ...section }) => section)
        resolve(sections)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting all sections', {event, eventId})
        reject('Error getting all sections')
      }
    })
  }

  async deleteSection(eventId, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete([eventId, id])

      request.onsuccess = () => resolve()
      request.onerror = event => {
        this.#logger.warn('Error deleting section', {event, id, eventId})
        reject('Error deleting section')
      }
    })
  }

  async reorderSections(eventId, sections) {
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    return Promise.all(
      sections.map((section, index) => new Promise((resolve, reject) => {
        const sectionWithEventId = { ...section, eventId, order: index }
        const request = store.put(sectionWithEventId)
        request.onsuccess = () => resolve(section)
        request.onerror = event => {
          this.#logger.warn('Error reordering sections', {event, section, index, eventId})
          reject('Error reordering sections')
        }
      })),
    )
  }
}

export default new CfbScheduleStorage()
