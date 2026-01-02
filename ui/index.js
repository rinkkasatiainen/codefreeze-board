import {Shell} from '@rinkkasatiainen/cfb-shell'
import {SessionDiscoveryModule} from '@rinkkasatiainen/cfb-session-discovery'
import {AuthorizationModule} from '@rinkkasatiainen/cfb-authorization'
// import {startMSW} from './assets/scripts/browser.js'

// Initialize MSW for development
if (import.meta.env?.DEV || window.location.hostname === 'localhost') {
  // await startMSW()
}

const shell = new Shell()

shell.addModule(new AuthorizationModule())
shell.addModule(new SessionDiscoveryModule())

async function configure() {
  await shell.configure()
  await shell.activate()
  await shell.run()
}

configure()

