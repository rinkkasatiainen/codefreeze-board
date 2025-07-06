import {CfbExampleElement} from './components/cfb-example.js'
import exampleStorage from './storage/example-storage.js'

export class NpmTemplateModule {
  #storage

  async configure() {
    this.#storage = await exampleStorage.init()
  }

  activate() {
    // Activation logic can be added here if needed
  }

  run() {
    // Only register if not already registered
    this.#ensureDefined(CfbExampleElement.elementName, CfbExampleElement)
  }

  #ensureDefined(elementName, element) {
    if (!customElements.get((elementName))) {
      customElements.define(elementName, element)
    }
  }
}
