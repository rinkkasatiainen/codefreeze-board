/**
 * A simple example element
 */

export class CfbExampleElement extends HTMLElement {
  static elementName = 'cfb-example-element'
  static definedAttributes = { dataName : 'data-name'}
  #name = undefined

  static get observedAttributes() {
    return [ CfbExampleElement.definedAttributes.dataName ]
  }

  connectedCallback() {
    this.#render(this.#name)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }
    this.#name = newValue
    if (name === CfbExampleElement.definedAttributes.dataName) {
      this.#render(newValue)
    }
  }

  #render(name = 'World'){
    this.innerHTML = `Hello ${name}!`
  }
}
