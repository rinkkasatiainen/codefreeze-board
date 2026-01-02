import authStorage from '../storage/auth-storage.js'

/**
 * Auth status component that shows login form or logged-in status with logout
 */
export class CfbAuthStatus extends HTMLElement {
  static elementName = 'cfb-auth-status'

  #userInfo = null

  async connectedCallback() {
    await this.#checkAuthStatus()
    this.#render()
    this.#attachEventListeners()

    // Listen for login success events
    window.addEventListener('cfb-login-success', () => {
      this.#checkAuthStatus().then(() => {
        this.#render()
      })
    })
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
      // Show logged-in status with logout button
      const username = this.#userInfo.username || 'User'
      this.innerHTML = `
        <div class="cfb-auth-status">
          <div class="cfb-auth-status__user">
            <span class="cfb-auth-status__label">Logged in as:</span>
            <span class="cfb-auth-status__username">${this.#escapeHtml(username)}</span>
          </div>
          <button id="logout-button" class="cfb-auth-status__logout">Logout</button>
        </div>
      `
    } else {
      // Show login form
      this.innerHTML = '<a href="/login">login</a>'
    }
  }

  #attachEventListeners() {
    const logoutButton = this.querySelector('#logout-button')
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        this.#handleLogout()
      })
    }
  }

  async #handleLogout() {
    try {
      await authStorage.clearTokens()
      this.#userInfo = null
      this.#render()

      // Dispatch logout event
      this.dispatchEvent(new CustomEvent('cfb-logout-success'))

      // Redirect to login page if not already there
      if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html'
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout error:', error)
    }
  }

  #escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

