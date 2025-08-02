import { Shell } from '@rinkkasatiainen/cfb-shell';
// import { SessionDiscoveryModule } from '@rinkkasatiainen/cfb-session-discovery';
// import { startMSW } from '../scripts/browser.js';

import { FakeModule } from './fakes.js';

// if (import.meta.env?.DEV || window.location.hostname === 'localhost') {
//   startMSW();
// }

 const shell = new Shell();

// shell.addModule(new SessionDiscoveryModule());
shell.addModule(new FakeModule());

shell.configure();
shell.activate();
shell.run(); 