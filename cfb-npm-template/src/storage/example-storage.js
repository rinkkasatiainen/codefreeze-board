class ExampleStorage {
  #logger
  #db

  constructor() {
    this.#logger = {
      warn: (message, data) => console.warn(message, data),
      error: (message, data) => console.error(message, data),
      info: (message, data) => console.info(message, data),
    }
    this.dbName = 'cfb-example-db'
    this.dbVersion = 1
    this.storeName = 'cfb-examples'
  }

  static #initialized = null

  async init() {
    if (ExampleStorage.#initialized) {
      return Promise.resolve(null)
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = event => {
        this.#logger.warn('Error opening database', {event})
        reject('Error opening database')
      }

      request.onsuccess = event => {
        this.#db = event.target.result
        ExampleStorage.#initialized = true
        resolve(null)
      }

      request.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' })
        }
      }
    })
  }

  async addExample(example) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(example)

      request.onsuccess = () => resolve(example)
      request.onerror = event => {
        this.#logger.warn('Error adding example', {event, example})
        reject('Error adding example')
      }
    })
  }

  async getExample(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting example', {event, id})
        reject('Error getting example')
      }
    })
  }

  async getAllExamples() {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting all examples', {event})
        reject('Error getting all examples')
      }
    })
  }

  async deleteExample(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = event => {
        this.#logger.warn('Error deleting example', {event, id})
        reject('Error deleting example')
      }
    })
  }
}

export default new ExampleStorage()
