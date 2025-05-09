import { Shell } from '@rinkkasatiainen/cfb-shell';

import { FakeModule } from './fakes.js';

const shell = new Shell();

shell.addModule(new FakeModule());

shell.configure();
shell.activate();
shell.run(); 