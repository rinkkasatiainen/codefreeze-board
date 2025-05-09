class CFBSection extends HTMLElement {
  constructor() {
    super()
    console.log('CFBSection constructor')
  }
}

class CFBSession extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Component initialization logic will go here
  }
}

export class FakeModule {
  configure() {
    customElements.define('cfb-section', CFBSection)
    customElements.define('cfb-session', CFBSession)
  }

  activate() {
    // Empty activation method
  }

  run() {
    // Empty run method
  }
}


