import {CfbExampleElement} from './components/cfb-example.js'
import exampleStorage from './storage/example-storage.js'

export class NpmTemplateModule {
  configure() {
    // Only register if not already registered
  }

  activate() {
    // Activation logic can be added here if needed
  }

  run() {
    this.#ensureDefined(CfbExampleElement.elementName, CfbExampleElement)
  }

  #ensureDefined(elementName, element) {
    if (!customElements.get((elementName))) {
      customElements.define(elementName, element)
    }
  }

  // Export storage for use in the template
  get storage() {
    return exampleStorage
  }
}

// Export storage directly as well
export {exampleStorage}
