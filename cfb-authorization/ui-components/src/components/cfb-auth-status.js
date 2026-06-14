import { createLogger } from '@rinkkasatiainen/cfb-observability'
import authStorage from '../lib/authenticated-user.js'
import { loginUrl } from './cfb-login.js'

/**
 * Auth status: session from BFF cookie via GET /api/auth/session
 */
export class CfbAuthStatus extends HTMLElement {
  static elementName = 'cfb-auth-status'
  logger = createLogger('cfb-auth-status')

  #userInfo = null

  async connectedCallback() {
    await this.#checkAuthStatus()
    this.#render()
    this.#attachEventListeners()
  }

  async #checkAuthStatus() {
    const isAuthenticated = await authStorage.isAuthenticated()
    if (isAuthenticated) {
      this.#userInfo = await authStorage.getUserInfo()
    } else {
      this.#userInfo = null
    }
  }

  #render() {
    if (this.#userInfo) {
      const username = this.#userInfo.username || 'User'
      this.innerHTML = `
        <div class="cfb-auth-status">
          <div class="cfb-auth-status__user">
            <span class="cfb-auth-status__label">Logged in as:</span>
            <span class="cfb-auth-status__username">${this.#escapeHtml(username)}</span>
          </div>
          <button id="logout-button" class="cfb-auth-status__logout" type="button">Logout</button>
        </div>
      `
    } else {
      const returnTo = window.location.pathname || '/index.html'
      this.innerHTML = `<a class="cfb-auth-status__login" href="${loginUrl(returnTo)}">Sign in</a>`
    }
  }

  #attachEventListeners() {
    const logoutButton = this.querySelector('#logout-button')
    if (logoutButton) {
      logoutButton.addEventListener('click', () => this.#handleLogout())
    }
  }

  async #handleLogout() {
    try {
      await authStorage.clearTokens()
      this.dispatchEvent(new CustomEvent('cfb-logout-success'))
    } catch (error) {
      this.logger.error('Logout error:', error)
    }
  }

  #escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
