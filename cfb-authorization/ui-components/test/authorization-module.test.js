import { expect } from 'chai'
import { AuthorizationModule } from '../../src/authorization-module.js'
import { CfbLogin } from '../../src/components/cfb-login.js'
import { CfbAuthStatus } from '../../src/components/cfb-auth-status.js'

describe('AuthorizationModule', () => {
  it('registers BFF login and auth status components on run', () => {
    const module = new AuthorizationModule()
    module.run()
    expect(customElements.get(CfbLogin.elementName)).to.exist
    expect(customElements.get(CfbAuthStatus.elementName)).to.exist
  })
})
