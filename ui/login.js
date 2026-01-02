import {Shell} from '@rinkkasatiainen/cfb-shell'
import {AuthorizationModule} from '@rinkkasatiainen/cfb-authorization'

const shell = new Shell()

const authModule = new AuthorizationModule()
shell.addModule(authModule)

async function configure() {
  await shell.configure()
  await shell.activate()
  await shell.run()

  // Check if already logged in and redirect
  // We need to import authStorage dynamically after module is configured
  try {
    if (authModule.authStorage) {
      const isAuthenticated = await authModule.authStorage.isAuthenticated()
      if (isAuthenticated) {
        // Already logged in, redirect to main app
        window.location.href = '/index.html'
        return
      }
    }
  } catch (error) {
    // If we can't check, continue to show login form
    // eslint-disable-next-line no-console
    console.warn('Could not check authentication status:', error)
  }

  // Listen for login success and redirect to index.html
  window.addEventListener('cfb-login-success', () => {
    window.location.href = '/index.html'
  })
}

configure()

