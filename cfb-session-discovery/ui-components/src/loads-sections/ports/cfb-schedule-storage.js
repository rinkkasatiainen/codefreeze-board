import { createLogger } from '@rinkkasatiainen/cfb-observability'

class CfbScheduleStorage {
  #logger

  constructor() {
    this.#logger = createLogger()
    this.dbName = 'cfb-db'
    this.dbVersion = 2
    this.storeName = 'cfb-sections'
    this.sessionsStoreName = 'cfb-sessions'
  }

  static #initialized = null

  async init() {
    if (CfbScheduleStorage.#initialized) {
      return Promise.resolve(null)
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = event => {
        this.#logger.warn('Error opening database', { event })
        reject('Error opening database')
      }

      request.onsuccess = event => {
        this.db = event.target.result
        CfbScheduleStorage.#initialized = true
        resolve(this.db)
      }

      request.onupgradeneeded = event => {
        const db = event.target.result
        // this.#logger.info('Database upgrade needed, creating stores...')

        if (!db.objectStoreNames.contains(this.storeName)) {
          // this.#logger.info('Creating sections store...')
          const store = db.createObjectStore(this.storeName, { keyPath: ['eventId', 'id'] })
          store.createIndex('eventId', 'eventId', { unique: false })
          store.createIndex('order', 'order', { unique: false })
        }
        if (!db.objectStoreNames.contains(this.sessionsStoreName)) {
          // this.#logger.info('Creating sessions store...')
          const sessionsDb = db.createObjectStore(this.sessionsStoreName, { keyPath: ['eventId', 'sectionId', 'id'] })
          sessionsDb.createIndex('eventId', 'eventId', { unique: false })
          sessionsDb.createIndex('sectionId', 'sectionId', { unique: false })
          sessionsDb.createIndex('eventSection', ['eventId', 'sectionId'], { unique: false })
          sessionsDb.createIndex('order', 'order', { unique: false })
          sessionsDb.createIndex('eventSessionId', ['eventId', 'id'], { unique: true })
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
        this.#logger.warn('Error adding section', { event, section, eventId })
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
        this.#logger.warn('Error getting section', { event, id, eventId })
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
        const sections = request.result
          .map(({ eventId: _, ...section }) => section)
          .sort((a, b) => a.order - b.order)
        resolve(sections)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting all sections', { event, eventId })
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
        this.#logger.warn('Error deleting section', { event, id, eventId })
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
          this.#logger.warn('Error reordering sections', { event, section, index, eventId })
          reject('Error reordering sections')
        }
      })),
    )
  }

  async addSession(eventId, session) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.sessionsStoreName], 'readwrite')
      const store = transaction.objectStore(this.sessionsStoreName)
      const sessionWithKeys = { ...session, eventId, sectionId: session.sectionId }

      // this.#logger.info('Adding session with keys:', {eventId, sectionId: session.sectionId, id: session.id})

      const request = store.add(sessionWithKeys)

      request.onsuccess = () => resolve(session)
      request.onerror = event => {
        this.#logger.warn('Error adding session', { event, session, eventId, sessionWithKeys })
        reject('Error adding session')
      }
    })
  }

  async getAllSessionsForEvent(eventId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.sessionsStoreName], 'readonly')
      const store = transaction.objectStore(this.sessionsStoreName)
      const index = store.index('eventId')
      const request = index.getAll(IDBKeyRange.only(eventId))

      request.onsuccess = () => {
        const sessions = request.result
          .map(({ eventId: _, ...session }) => session)
        resolve(sessions)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting all sessions', { event, eventId, sectionId })
        reject('Error getting all sessions')
      }
    })
  }

  async getAllSessionsForSection(eventId, sectionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.sessionsStoreName], 'readonly')
      const store = transaction.objectStore(this.sessionsStoreName)
      const index = store.index('eventSection')
      const request = index.getAll(IDBKeyRange.only([eventId, sectionId]))

      request.onsuccess = () => {
        const sessions = request.result
          .map(({ eventId: _, ...session }) => session)
        resolve(sessions)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting all sessions', { event, eventId, sectionId })
        reject('Error getting all sessions')
      }
    })
  }

  async deleteSession(eventId, sessionId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.sessionsStoreName], 'readwrite')
      const store = transaction.objectStore(this.sessionsStoreName)

      // First get the session to find its sectionId
      const index = store.index('eventSessionId')
      const getRequest = index.get([eventId, sessionId])

      getRequest.onsuccess = async () => {
        const session = getRequest.result
        if (!session) {
          reject('Session not found')
          return
        }

        const deleteRequest = store.delete([eventId, session.sectionId, sessionId])
        deleteRequest.onsuccess = () => resolve()
        deleteRequest.onerror = event => {
          this.#logger.warn('Error deleting session', { event, sessionId, eventId })
          reject('Error deleting session')
        }
      }

      getRequest.onerror = event => {
        this.#logger.warn('Error getting session for deletion', { event, sessionId, eventId })
        reject('Error getting session for deletion')
      }
    })
  }

  // Method to reset database for testing
  async resetDatabase() {
    if (this.db) {
      this.db.close()
    }
    CfbScheduleStorage.#initialized = false

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName)

      request.onsuccess = () => {
        this.#logger.info('Database deleted successfully')
        resolve()
      }

      request.onerror = event => {
        this.#logger.warn('Error deleting database', { event })
        reject('Error deleting database')
      }
    })
  }
}

export default new CfbScheduleStorage()
