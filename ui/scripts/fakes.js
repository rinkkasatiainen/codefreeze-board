class CFBSection extends HTMLElement {
  constructor() {
    super()
    console.log('CFBSection constructor')
  }
}

class FakeModule {
  configure() {
    customElements.define('cfb-section', CFBSection)
  }

  activate() {
    // Empty activation method
  }

  run() {
    // Empty run method
  }
}


