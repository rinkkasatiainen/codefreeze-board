import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js'
import authStorage from '../storage/auth-storage.js'
import { decodesIdToken } from '../lib/decodes-id-token.js'
import { redirectTo } from '../lib/redirect-to.js'

/**
 * Change password component for Cognito
 * Handles both initial password change (NEW_PASSWORD_REQUIRED) and regular password changes
 */
export class CfbChangePassword extends HTMLElement {
  static elementName = 'cfb-change-password'

  #isLoading = false
  #mode = 'change' // 'change' or 'new-password-required'

  connectedCallback() {
    this.#render()
    this.#attachEventListeners()
  }

  static get observedAttributes() {
    return ['data-mode']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-mode' && newValue !== oldValue) {
      this.#mode = newValue || 'change'
      this.#render()
      this.#attachEventListeners()
    }
  }

  #getCognitoConfig() {
    if (!window.CFB_CONFIG) {
      throw new Error('CFB_CONFIG not found. Make sure Cognito config is injected at build time.')
    }
    return window.CFB_CONFIG
  }

  #render() {
    const isNewPasswordRequired = this.#mode === 'new-password-required'
    const title = isNewPasswordRequired
      ? 'Set Your Password'
      : 'Change Password'
    const submitText = isNewPasswordRequired
      ? 'Set Password'
      : 'Change Password'

    this.innerHTML = `
      <div class="cfb-change-password">
        <h2>${this.#escapeHtml(title)}</h2>
        <form class="cfb-change-password__form" id="change-password-form">
          ${isNewPasswordRequired ? `
            <div class="cfb-change-password__field">
              <label for="temp-password">Temporary Password</label>
              <input type="password" id="temp-password" name="temp-password" required autocomplete="current-password">
            </div>
          ` : `
            <div class="cfb-change-password__field">
              <label for="old-password">Current Password</label>
              <input type="password" id="old-password" name="old-password" required autocomplete="current-password">
            </div>
          `}
          <div class="cfb-change-password__field">
            <label for="new-password">New Password</label>
            <input type="password" id="new-password" name="new-password" required autocomplete="new-password">
          </div>
          <div class="cfb-change-password__field">
            <label for="confirm-password">Confirm New Password</label>
            <input type="password" id="confirm-password" name="confirm-password" required autocomplete="new-password">
          </div>
          <div class="cfb-change-password__error" id="error-message" style="display: none;"></div>
          <div class="cfb-change-password__success" id="success-message" style="display: none;"></div>
          <button type="submit" id="submit-button" ${this.#isLoading ? 'disabled' : ''}>
            ${this.#isLoading ? 'Processing...' : submitText}
          </button>
        </form>
      </div>
    `
  }

  #attachEventListeners() {
    const form = this.querySelector('#change-password-form')
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        if (this.#mode === 'new-password-required') {
          this.#handleNewPasswordRequired()
        } else {
          this.#handlePasswordChange()
        }
      })
    }
  }

  async #handleNewPasswordRequired() {
    if (this.#isLoading) {
      return
    }

    const tempPasswordInput = this.querySelector('#temp-password')
    const newPasswordInput = this.querySelector('#new-password')
    const confirmPasswordInput = this.querySelector('#confirm-password')
    const submitButton = this.querySelector('#submit-button')

    const tempPassword = tempPasswordInput.value
    const newPassword = newPasswordInput.value
    const confirmPassword = confirmPasswordInput.value

    // Validation
    if (!tempPassword || !newPassword || !confirmPassword) {
      this.#showError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      this.#showError('New passwords do not match')
      return
    }

    this.#isLoading = true
    this.#hideError()
    this.#hideSuccess()
    submitButton.disabled = true
    submitButton.textContent = 'Processing...'

    try {
      const config = this.#getCognitoConfig()
      const userPool = new CognitoUserPool({
        UserPoolId: config.userPoolId,
        ClientId: config.clientId,
      })

      // Get username from stored tokens or sessionStorage (for new password required flow)
      let username
      if (this.#mode === 'new-password-required') {
        username = sessionStorage.getItem('cfb-temp-username')
        if (!username) {
          throw new Error('Session expired. Please login again.')
        }
      } else {
        const tokens = await authStorage.getTokens()
        if (!tokens || !tokens.userInfo) {
          throw new Error('Not authenticated. Please login first.')
        }
        username = tokens.userInfo.username
        if (!username) {
          throw new Error('Username not found. Please login again.')
        }
      }

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      await new Promise((resolve, reject) => {
        // Complete the NEW_PASSWORD_REQUIRED challenge
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
          onSuccess: async session => {
            try {
              const accessToken = session.getAccessToken().getJwtToken()
              const idToken = session.getIdToken().getJwtToken()
              const refreshToken = session.getRefreshToken().getToken()

              const userInfo = decodesIdToken(idToken)

              const newTokens = {
                accessToken,
                idToken,
                refreshToken,
                expiresAt: session.getAccessToken().getExpiration() * 1000,
                userInfo: {
                  username: userInfo['cognito:username'] || userInfo.sub || username,
                  email: userInfo.email,
                },
              }

              await authStorage.saveTokens(newTokens)

              // Clear temporary session storage
              sessionStorage.removeItem('cfb-temp-username')
              sessionStorage.removeItem('cfb-temp-email')

              this.#showSuccess('Password set successfully! Redirecting...')

              // Dispatch success event
              this.dispatchEvent(new CustomEvent('cfb-password-change-success',
                {
                  detail:
                    { userInfo: newTokens.userInfo },
                }))

              // Redirect after a short delay
              redirectTo('/index.html', 1500)

              resolve(newTokens)
            } catch (error) {
              reject(error)
            }
          },
          onFailure: err => {
            reject(err)
          },
        })
      })
    } catch (error) {
      this.#showError(error.message || 'Failed to set password. Please try again.')
      this.dispatchEvent(new CustomEvent('cfb-password-change-error', { detail: { error } }))
    } finally {
      this.#isLoading = false
      submitButton.disabled = false
      submitButton.textContent = 'Set Password'
    }
  }

  async #handlePasswordChange() {
    if (this.#isLoading) {
      return
    }

    const newPasswordInput = this.querySelector('#new-password')
    const confirmPasswordInput = this.querySelector('#confirm-password')
    const oldPasswordInput = this.querySelector('#old-password')
    const submitButton = this.querySelector('#submit-button')

    const oldPassword = oldPasswordInput?.value || ''
    const newPassword = newPasswordInput.value
    const confirmPassword = confirmPasswordInput.value

    // Validation
    if (!oldPassword) {
      this.#showError('Please enter your current password')
      return
    }

    if (!newPassword || !confirmPassword) {
      this.#showError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      this.#showError('New passwords do not match')
      return
    }

    if (newPassword === oldPassword) {
      this.#showError('New password must be different from current password')
      return
    }

    this.#isLoading = true
    this.#hideError()
    this.#hideSuccess()
    submitButton.disabled = true
    submitButton.textContent = 'Processing...'

    try {
      const config = this.#getCognitoConfig()
      const userPool = new CognitoUserPool({
        UserPoolId: config.userPoolId,
        ClientId: config.clientId,
      })

      const tokens = await authStorage.getTokens()
      const username = tokens?.userInfo?.username

      if (!username) {
        throw new Error('Not authenticated. Please login again.')
      }

      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      })

      await new Promise((resolve, reject) => {
        cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      })

      this.#showSuccess('Password changed successfully!')

      // Dispatch success event
      this.dispatchEvent(new CustomEvent('cfb-password-change-success'))

      // Clear form
      if (oldPasswordInput) {
        oldPasswordInput.value = ''
      }
      newPasswordInput.value = ''
      confirmPasswordInput.value = ''
    } catch (error) {
      this.#showError(error.message || 'Failed to change password. Please check your current password and try again.')
      this.dispatchEvent(new CustomEvent('cfb-password-change-error', { detail: { error } }))
    } finally {
      this.#isLoading = false
      submitButton.disabled = false
      submitButton.textContent = 'Change Password'
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
    if (errorMessage) {
      errorMessage.textContent = message
      errorMessage.style.display = 'block'
    }
  }

  #hideError() {
    const errorMessage = this.querySelector('#error-message')
    if (errorMessage) {
      errorMessage.style.display = 'none'
    }
  }

  #showSuccess(message) {
    const successMessage = this.querySelector('#success-message')
    if (successMessage) {
      successMessage.textContent = message
      successMessage.style.display = 'block'
    }
  }

  #hideSuccess() {
    const successMessage = this.querySelector('#success-message')
    if (successMessage) {
      successMessage.style.display = 'none'
    }
  }

  #escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

