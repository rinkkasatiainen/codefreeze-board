/**
 * Column title component that supports drag and drop functionality
 */

export class CfbColumnTitleElement extends HTMLElement {
  static elementName = 'cfb-column-title'
  static definedAttributes = {name: 'data-name'}
  #name = undefined
  #dragCounter = 0

  static get observedAttributes() {
    return [CfbColumnTitleElement.definedAttributes.name]
  }

  connectedCallback() {
    this.#render(this.#name)
    this.#setupEventListeners()
  }

  disconnectedCallback() {
    this.#removeEventListeners()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }
    this.#name = newValue
    if (name === CfbColumnTitleElement.definedAttributes.name) {
      this.#render(newValue)
    }
  }

  #render(name) {
    this.innerHTML = `<h2 class="cfb-column__title">${name}</h2>`
  }

  #setupEventListeners() {
    // TODO: Implement drag and drop event listeners
    this.addEventListener('dragenter', this.#handleDragEnter)
    this.addEventListener('dragleave', this.#handleDragLeave)
    this.addEventListener('dragover', this.#handleDragOver)
    this.addEventListener('drop', this.#handleDrop)
    // When a draggable CfbSession is dragged over, dispatch a custom event
  }

  #removeEventListeners() {
    // TODO: Clean up event listeners when component is disconnected
    this.removeEventListener('dragenter', this.#handleDragEnter)
    this.removeEventListener('dragleave', this.#handleDragLeave)
    this.removeEventListener('dragover', this.#handleDragOver)
    this.removeEventListener('drop', this.#handleDrop)
  }

  #handleDragOver = e => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
  }

  #handleDrop = () => {
    this.#dragCounter = 0
  }

  #handleDragEnter = () => {
    this.#dragCounter++
    if (this.#dragCounter === 1) {

      // Dispatch on-top event
      const onTopEvent = new CustomEvent('cfb-session-on-top-title', {
        bubbles: true,
        composed: true,
        detail: {
          target: this,
        },
      })
      this.dispatchEvent(onTopEvent)
    }
  }

  #handleDragLeave = () => {
    this.#dragCounter--
  }
}
