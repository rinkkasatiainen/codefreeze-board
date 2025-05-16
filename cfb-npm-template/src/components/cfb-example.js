/**
 * A simple example element
 */

export class CfbExampleElement extends HTMLElement {
  static elementName = 'cfb-example-element'
  static definedAttributes = { dataName : 'data-name'}
  static get observedAttributes() {
    return [ CfbExampleElement.definedAttributes.dataName ]
  }

  connectedCallback() {
    this.#render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }
    if (name === CfbExampleElement.definedAttributes.dataName) {
      this.#render(newValue)
    }
  }

  #render(name = 'World'){
    this.innerHTML = `Hello ${name}!`
  }
}
