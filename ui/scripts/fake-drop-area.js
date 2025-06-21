import {CFBSession} from './fake-session.js'

export class CFBDropArea extends HTMLElement {
  static get observedAttributes() {
    return ['data-index']
  }

  constructor() {
    super()
    this.addEventListener('dragover', this.handleDragOver.bind(this))
    this.addEventListener('drop', this.handleDrop.bind(this))
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-index') {
    }
  }

  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    return false
  }

  handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()

    // Dispatch custom event for move completion
    const movedEvent = new CustomEvent('cfb-moved-session', {
      bubbles: true,
      composed: true,
      detail: {
        session: CFBSession.draggedItem,
        newPosition: parseInt(this.getAttribute('data-index'), 10),
        target: this
      }
    })
    this.dispatchEvent(movedEvent)

    return false
  }
}