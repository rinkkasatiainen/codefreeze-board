import { CognitoUserPool, AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js'
import authStorage from '../storage/auth-storage.js'

/**
 * Login form component for Cognito authentication
 */
export class CfbLoginForm extends HTMLElement {
  static elementName = 'cfb-login-form'

  #isLoading = false

  constructor() {
    super()
    this.#render()
    this.#attachEventListeners()
  }

  #getCognitoConfig() {
    if (!window.CFB_CONFIG) {
      throw new Error('CFB_CONFIG not found. Make sure Cognito config is injected at build time.')
    }
    return window.CFB_CONFIG
  }

  #render() {
    this.innerHTML = `
      <form class="cfb-login-form" id="login-form">
        <div class="cfb-login-form__field">
          <label for="username">Username</label><p>abc</p>
          <input type="text" id="username" name="username" required autocomplete="username">
        </div>
        <div class="cfb-login-form__field">
          <label for="password">Password</label><p>CfbBoardPassword123</p>
          <input type="password" id="password" name="password" required autocomplete="current-password">
        </div>
        <div class="cfb-login-form__error" id="error-message" style="display: none;"></div>
        <button type="submit" id="login-button" ${this.#isLoading ? 'disabled' : ''}>
          ${this.#isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    `
  }

  #attachEventListeners() {
    const form = this.querySelector('#login-form')
    form.addEventListener('submit', e => {
      e.preventDefault()
      this.#handleLogin()
    })
  }

  async #handleLogin() {
    if (this.#isLoading) {
      return
    }

    const usernameInput = this.querySelector('#username')
    const passwordInput = this.querySelector('#password')
    // const errorMessage = this.querySelector('#error-message')
    const loginButton = this.querySelector('#login-button')

    const username = usernameInput.value.trim()
    const password = passwordInput.value

    if (!username || !password) {
      this.#showError('Please enter both username and password')
      return
    }

    this.#isLoading = true
    this.#hideError()
    loginButton.disabled = true
    loginButton.textContent = 'Logging in...'

    try {
      const config = this.#getCognitoConfig()
      const userPool = new CognitoUserPool({
        UserPoolId: config.userPoolId,
        ClientId: config.clientId,
      })

      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      })

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      await new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: async session => {
            try {
              const accessToken = session.getAccessToken().getJwtToken()
              const idToken = session.getIdToken().getJwtToken()
              const refreshToken = session.getRefreshToken().getToken()

              // Decode ID token to get user info (basic decode without verification)
              const userInfo = this.#decodeIdToken(idToken)

              const tokens = {
                accessToken,
                idToken,
                refreshToken,
                expiresAt: session.getAccessToken().getExpiration() * 1000, // Convert to milliseconds
                userInfo: {
                  username: userInfo['cognito:username'] || userInfo.sub || username,
                  email: userInfo.email,
                },
              }

              await authStorage.saveTokens(tokens)

              // Dispatch login success event
              this.dispatchEvent(new CustomEvent('cfb-login-success', { detail: { userInfo: tokens.userInfo } }))

              resolve(tokens)
            } catch (error) {
              reject(error)
            }
          },
          onFailure: err => {
            reject(err)
          },
          newPasswordRequired: (userAttributes, _requiredAttributes) => {
            // Store username temporarily for password change page
            // We'll need the user to enter their temp password again on that page
            sessionStorage.setItem('cfb-temp-username', username)
            if (userAttributes?.email) {
              sessionStorage.setItem('cfb-temp-email', userAttributes.email)
            }
            // Redirect to change password page
            window.location.href = '/change-password.html?mode=new-password-required'
          },
        })
      })
    } catch (error) {
      this.#showError(error.message || 'Login failed. Please check your credentials.')
      this.dispatchEvent(new CustomEvent('cfb-login-error', { detail: { error } }))
    } finally {
      this.#isLoading = false
      loginButton.disabled = false
      loginButton.textContent = 'Login'
    }
  }

  #decodeIdToken(token) {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      return decoded
    } catch (_error) { // eslint-disable-line no-unused-vars
      return {}
    }
  }

  #showError(message) {
    const errorMessage = this.querySelector('#error-message')
    errorMessage.textContent = message
    errorMessage.style.display = 'block'
  }

  #hideError() {
    const errorMessage = this.querySelector('#error-message')
    errorMessage.style.display = 'none'
  }
}

