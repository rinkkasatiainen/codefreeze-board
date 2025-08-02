import { Shell } from '@rinkkasatiainen/cfb-shell';
import { SessionDiscoveryModule } from '@rinkkasatiainen/cfb-session-discovery';
import { startMSW } from './assets/scripts/browser.js';

// Initialize MSW for development
if (import.meta.env?.DEV || window.location.hostname === 'localhost') {
  await startMSW();
}

const shell = new Shell();

shell.addModule(new SessionDiscoveryModule());

shell.configure();
shell.activate();
shell.run();

