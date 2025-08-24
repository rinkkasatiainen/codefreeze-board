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

  #dragCounter = 0

  constructor() {
    super()

    // Touch drag state
    this.isTouchDragging = false
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchThreshold = 10 // Minimum distance to start dragging
    this.touchDragDirection = null // 'horizontal' or 'vertical'

  }

  connectedCallback() {
    this.setAttribute('draggable', 'true')

    this.#setupEventListeners()
    // Touch events
    // this.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    // this.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    // this.addEventListener('touchend', this.handleTouchEnd, { passive: false })
  }

  disconnectedCallback() {
    this.#removeEventListeners()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }

    if (name === CfbSession.definedAttributes.sessionId) {
      this.#sessionId = newValue
    }
  }

  #setupEventListeners() {
    this.addEventListener('dragstart', this.#handleDragStart)
    this.addEventListener('dragend', this.#handleDragEnd)
    this.addEventListener('dragenter', this.#handleDragEnter)
    this.addEventListener('dragleave', this.#handleDragLeave)
    this.addEventListener('dragover', this.#handleDragOver)
    this.addEventListener('drop', this.#handleDrop.bind(this))
  }

  #removeEventListeners() {
    this.removeEventListener('dragstart', this.#handleDragStart)
    this.removeEventListener('dragend', this.#handleDragEnd)
    this.removeEventListener('dragenter', this.#handleDragEnter)
    this.removeEventListener('dragleave', this.#handleDragLeave)
    this.removeEventListener('dragover', this.#handleDragOver)
    this.removeEventListener('drop', this.#handleDrop.bind(this))
  }

  #handleDragOver = e => {
    e.preventDefault()
  }

  #handleDrop = () => {
    this.#dragCounter = 0
  }

  // Use arrow functions to maintain 'this' context
  #handleDragStart = e => {
    this.style.opacity = '0.5'
    this.classList.add('dragging')
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', this.innerHTML)
    }
  }

  #handleDragEnd = _evt => {
    this.style.opacity = '1'
    this.classList.remove('dragging')
    const movedEvent = new CustomEvent('cfb-moved-session', {
      bubbles: true,
      composed: true,
      detail: {
        target: this,
      },
    })
    this.dispatchEvent(movedEvent)
  }

  #handleDragEnter = e => {
    this.#dragCounter++
    if (this.#dragCounter === 1) {
      this.isDragging = true
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
    }
  }

  #handleDragLeave = () => {
    this.#dragCounter--
  }

}
