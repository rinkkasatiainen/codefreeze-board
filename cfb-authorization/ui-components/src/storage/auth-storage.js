class AuthStorage {
  #logger
  #db

  constructor() {
    this.#logger = {
      // eslint-disable-next-line no-console
      warn: (message, data) => console.warn(message, data),
      // eslint-disable-next-line no-console
      error: (message, data) => console.error(message, data),
      // eslint-disable-next-line no-console
      info: (message, data) => console.info(message, data),
    }
    this.dbName = 'cfb-auth-db'
    this.dbVersion = 1
    this.storeName = 'auth-tokens'
  }

  static #initialized = null

  async init() {
    if (AuthStorage.#initialized) {
      return Promise.resolve(null)
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = event => {
        this.#logger.warn('Error opening database', { event })
        reject(new Error('Error opening database'))
      }

      request.onsuccess = event => {
        this.#db = event.target.result
        AuthStorage.#initialized = true
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

  async saveTokens(tokens) {
    const tokenData = {
      id: 'auth-tokens',
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      userInfo: tokens.userInfo,
    }
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(tokenData)

      request.onsuccess = () => resolve(tokenData)
      request.onerror = event => {
        this.#logger.warn('Error saving tokens', { event, tokens })
        reject(new Error('Error saving tokens'))
      }
    })
  }

  async getTokens() {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get('auth-tokens')

      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = event => {
        this.#logger.warn('Error getting tokens', { event })
        reject(new Error('Error getting tokens'))
      }
    })
  }

  async clearTokens() {
    return new Promise((resolve, reject) => {
      const transaction = this.#db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete('auth-tokens')

      request.onsuccess = () => resolve()
      request.onerror = event => {
        this.#logger.warn('Error clearing tokens', { event })
        reject(new Error('Error clearing tokens'))
      }
    })
  }

  async isAuthenticated() {
    const tokens = await this.getTokens()
    if (!tokens) {
      return false
    }
    // Check if access token is expired
    if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
      return false
    }
    return true
  }

  async isTokenExpired() {
    const tokens = await this.getTokens()
    if (!tokens || !tokens.expiresAt) {
      return true
    }
    return tokens.expiresAt < Date.now()
  }

  async getAccessToken() {
    const tokens = await this.getTokens()
    return tokens?.accessToken || null
  }

  async getRefreshToken() {
    const tokens = await this.getTokens()
    return tokens?.refreshToken || null
  }

  async getUserInfo() {
    const tokens = await this.getTokens()
    return tokens?.userInfo || null
  }
}

export default new AuthStorage()

