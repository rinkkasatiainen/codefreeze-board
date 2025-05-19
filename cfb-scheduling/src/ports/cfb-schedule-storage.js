class CfbScheduleStorage {
  constructor() {
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
        reject('Error opening database')
      }

      request.onsuccess = event => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = event => {
        const db = event.target.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('order', 'order', { unique: false })
        }
      }
    })
  }

  async addSection(section) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(section)

      request.onsuccess = () => resolve(section)
      request.onerror = () => reject('Error adding section')
    })
  }

  async updateSection(section) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(section)

      request.onsuccess = () => resolve(section)
      request.onerror = () => reject('Error updating section')
    })
  }

  async getSection(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject('Error getting section')
    })
  }

  async getAllSections() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject('Error getting all sections')
    })
  }

  async deleteSection(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject('Error deleting section')
    })
  }

  async reorderSections(sections) {
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)

    return Promise.all(
      sections.map((section, index) => new Promise((resolve, reject) => {
        section.order = index
        const request = store.put(section)
        request.onsuccess = () => resolve(section)
        request.onerror = () => reject('Error reordering sections')
      })),
    )
  }
}

export default new CfbScheduleStorage()
