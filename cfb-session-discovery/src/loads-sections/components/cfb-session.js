/**
 * A session component that displays individual session data
 */

import {createLogger} from '@rinkkasatiainen/cfb-observability'

export class CfbSession extends HTMLElement {
  static elementName = 'cfb-session'

  static definedAttributes = {
    sessionId: 'data-session-id',
  }

  #logger = createLogger()
  #sessionId = undefined

  static get observedAttributes() {
    return [
      CfbSession.definedAttributes.sessionId,
    ]
  }

  static draggedItem = null

  constructor() {
    super()

    // Touch drag state
    this.isTouchDragging = false
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchThreshold = 10 // Minimum distance to start dragging
    this.touchDragDirection = null // 'horizontal' or 'vertical'

    // Use arrow functions to maintain 'this' context
    this.handleDragStart = e => {
      CfbSession.draggedItem = this
      this.style.opacity = '0.5'
      this.classList.add('dragging')
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/html', this.innerHTML)
      }
    }

    this.handleDragEnd = e => {
      this.style.opacity = '1'
      this.classList.remove('dragging')
      CfbSession.draggedItem = null
      const movedEvent = new CustomEvent('cfb-moved-session', {
        bubbles: true,
        composed: true,
        detail: {
          target: this,
        },
      })
      this.dispatchEvent(movedEvent)
    }

    this.handleDragOver = e => {
      e.preventDefault()
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move'
      }

      // Dispatch on-top event
      const onTopEvent = new CustomEvent('cfb-session-on-top', {
        bubbles: true,
        composed: true,
        detail: {
          target: this,
        },
      })
      this.dispatchEvent(onTopEvent)
      return false
    }
  }

  connectedCallback() {
    this.setAttribute('draggable', 'true')

    // Mouse events
    this.addEventListener('dragstart', this.handleDragStart)
    this.addEventListener('dragend', this.handleDragEnd)
    this.addEventListener('dragover', this.handleDragOver)

    // Touch events
    // this.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    // this.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    // this.addEventListener('touchend', this.handleTouchEnd, { passive: false })
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }

    if (name === CfbSession.definedAttributes.sessionId) {
      this.#sessionId = newValue
    }
  }
}
