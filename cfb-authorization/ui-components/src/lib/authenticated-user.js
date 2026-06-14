import { redirectTo } from './redirect-to.js'

const SESSION_URL = '/api/auth/session'
const LOGOUT_URL = '/api/auth/logout'

class AuthenticatedUser {
  #cachedSession = null

  async init() {
    this.#cachedSession = null
  }

  async getSession() {
    if(this.#cachedSession){
      return this.#cachedSession
    }
    try {
      const response = await fetch(SESSION_URL, { credentials: 'include' })
      if (!response.ok) {
        this.#cachedSession = null
        return null
      }
      const data = await response.json()
      if (!data.authenticated) {
        this.#cachedSession = null
        return null
      }
      this.#cachedSession = data
      return data
    } catch {
      this.#cachedSession = null
      return null
    }
  }

  async isAuthenticated() {
    const session = await this.getSession()
    return Boolean(session?.authenticated)
  }

  async getUserInfo() {
    const session = await this.getSession()
    return session?.userInfo || null
  }

  async clearTokens() {
    this.#cachedSession = null
    const response = await fetch(LOGOUT_URL, { credentials: 'include' })
    if (!response.ok) {
      throw new Error('Logout failed')
    }
    redirectTo(LOGOUT_URL)
  }
}

export default new AuthenticatedUser()
