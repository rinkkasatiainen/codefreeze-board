import {Shell} from '@rinkkasatiainen/cfb-shell'
import {AuthorizationModule} from '@rinkkasatiainen/cfb-authorization'

const shell = new Shell()

const authModule = new AuthorizationModule()
shell.addModule(authModule)

async function configure() {
  await shell.configure()
  await shell.activate()
  await shell.run()

  // Get mode from URL parameter
  const urlParams = new URLSearchParams(window.location.search)
  const mode = urlParams.get('mode') || 'change'

  // Set the mode on the component
  const component = document.getElementById('change-password-component')
  if (component) {
    component.setAttribute('data-mode', mode)
  }

  // Listen for password change success
  window.addEventListener('cfb-password-change-success', () => {
    if (mode === 'new-password-required') {
      // Already handled in component (redirects to index.html)
    } else {
      // Regular password change - show success and maybe redirect after delay
      setTimeout(() => {
        window.location.href = '/index.html'
      }, 2000)
    }
  })
}

configure()

