import {CFBDropArea} from './fake-drop-area.js'
import {CFBSession} from './fake-session.js'
import {CFBColumnTitle} from './fake-column-title.js'
import {CFBSection} from './fake-section.js'

export class FakeModule {
  configure() {
    customElements.define('cfb-section', CFBSection)
    customElements.define('cfb-session', CFBSession)
    customElements.define('cfb-drop-area', CFBDropArea)
    customElements.define('cfb-column-title', CFBColumnTitle)
  }

  activate() {
  }

  run() {
  }
}


