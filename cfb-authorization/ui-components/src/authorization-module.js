import { CfbLogin } from './components/cfb-login.js'
import { CfbAuthStatus } from './components/cfb-auth-status.js'
import authStorage from './lib/authenticated-user.js'

export class AuthorizationModule {
  authStorage = authStorage

  async configure() {
    await authStorage.init()
  }

  activate() {
    // Activation logic can be added here if needed
  }

  run() {
    this.#ensureDefined(CfbLogin.elementName, CfbLogin)
    this.#ensureDefined(CfbAuthStatus.elementName, CfbAuthStatus)
  }

  #ensureDefined(elementName, element) {
    if (!customElements.get(elementName)) {
      customElements.define(elementName, element)
    }
  }
}
