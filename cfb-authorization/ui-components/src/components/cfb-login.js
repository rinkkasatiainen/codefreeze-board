import { redirectTo } from '../lib/redirect-to.js'

/**
 * Login entry: redirects to the auth BFF (Cognito Hosted UI + PKCE).
 */
export class CfbLogin extends HTMLElement {
  static elementName = 'cfb-login'

  connectedCallback() {
    this.#render()
    this.querySelector('[data-sign-in]')?.addEventListener('click', () => this.#startLogin())
  }

  #render() {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const errorBlock = error
      ? `<p class="cfb-login__error" role="alert">${this.#escapeHtml(error)}</p>`
      : ''

    this.innerHTML = `
      <div class="cfb-login">
        ${errorBlock}
        <p>Sign in with your CodeFreeze Board account.</p>
        <button type="button" class="cfb-login__button" data-sign-in>Sign in</button>
      </div>
    `
  }

  #startLogin() {
    const returnTo = encodeURIComponent(window.location.pathname === '/login.html'
      ? '/index.html'
      : window.location.pathname)
    window.location.href = `/api/auth/login?returnTo=${returnTo}`
  }

  #escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

export function loginUrl(returnTo = '/index.html') {
  return `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
}

export { redirectTo }
