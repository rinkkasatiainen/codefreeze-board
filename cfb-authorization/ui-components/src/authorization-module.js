import {CfbLoginForm} from './components/cfb-login-form.js'
import {CfbAuthStatus} from './components/cfb-auth-status.js'
import {CfbChangePassword} from './components/cfb-change-password.js'
import authStorage from './storage/auth-storage.js'

export class AuthorizationModule {
  async configure() {
    await authStorage.init()
  }

  activate() {
    // Activation logic can be added here if needed
  }

  run() {
    // Register custom elements
    this.#ensureDefined(CfbLoginForm.elementName, CfbLoginForm)
    this.#ensureDefined(CfbAuthStatus.elementName, CfbAuthStatus)
    this.#ensureDefined(CfbChangePassword.elementName, CfbChangePassword)
  }

  #ensureDefined(elementName, element) {
    if (!customElements.get(elementName)) {
      customElements.define(elementName, element)
    }
  }
}

