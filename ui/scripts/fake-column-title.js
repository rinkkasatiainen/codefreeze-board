import {CFBSession} from './fake-session.js'
import {debounce} from './debounce.js'

export class CFBColumnTitle extends HTMLElement {
  #deb = debounce(300)

  constructor() {
    super()
    this.addEventListener('dragover', this.handleDragOver.bind(this))
  }


  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (CFBSession.draggedItem) {
      this.#deb(this.#sendEvent.bind(this))
    }
    return false
  }

  #sendEvent = () => {
    // Create the same event that a cfb-session would dispatch on hover
    const onTopEvent = new CustomEvent('cfb-session-on-top', {
      bubbles: true,
      composed: true,
      detail: {
        target: this
      }
    })

    this.dispatchEvent(onTopEvent)
  }
}

