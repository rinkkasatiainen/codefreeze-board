import {CFBSession} from './fake-session.js'
import {debounce} from './debounce.js'

export class CFBColumnTitle extends HTMLElement {
  #deb = debounce(300)

  constructor() {
    super()
    this.addEventListener('dragover', this.handleDragOver.bind(this))
    
    // Touch event handlers for column titles
    this.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
  }

  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (CFBSession.draggedItem) {
      this.#deb(this.#sendEvent.bind(this))
    }
    return false
  }

  handleTouchStart(e) {
    // Store touch start position for potential drag detection
    if (e.touches.length === 1) {
      this.touchStartY = e.touches[0].clientY
    }
  }

  handleTouchMove(e) {
    if (e.touches.length !== 1 || !CFBSession.draggedItem) return
    
    const touch = e.touches[0]
    const deltaY = Math.abs(touch.clientY - this.touchStartY)
    
    // If touch is over this column title and we have a dragged item
    const rect = this.getBoundingClientRect()
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      this.#deb(this.#sendEvent.bind(this))
    }
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

