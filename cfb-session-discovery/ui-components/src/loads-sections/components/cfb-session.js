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

    // Touch events for mobile devices
    this.addEventListener('touchstart', this.#handleTouchStart, { passive: false })
    this.addEventListener('touchmove', this.#handleTouchMove, { passive: false })
    this.addEventListener('touchend', this.#handleTouchEnd, { passive: false })
    this.addEventListener('touchcancel', this.#handleTouchCancel, { passive: false })
  }

  #removeEventListeners() {
    this.removeEventListener('dragstart', this.#handleDragStart)
    this.removeEventListener('dragend', this.#handleDragEnd)
    this.removeEventListener('dragenter', this.#handleDragEnter)
    this.removeEventListener('dragleave', this.#handleDragLeave)
    this.removeEventListener('dragover', this.#handleDragOver)
    this.removeEventListener('drop', this.#handleDrop.bind(this))

    // Remove touch event listeners
    this.removeEventListener('touchstart', this.#handleTouchStart)
    this.removeEventListener('touchmove', this.#handleTouchMove)
    this.removeEventListener('touchend', this.#handleTouchEnd)
    this.removeEventListener('touchcancel', this.#handleTouchCancel)
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

  // Touch event handlers for mobile devices
  #handleTouchStart = e => {
    // Prevent default immediately to stop iOS Safari's drag-to-search behavior
    e.preventDefault()

    if (e.touches.length !== 1) {
      return // Only handle single touch
    }

    const touch = e.touches[0]
    this.touchStartX = touch.clientX
    this.touchStartY = touch.clientY
    this.isTouchDragging = false
    this.touchDragDirection = null
  }

  #handleTouchMove = e => {
    if (e.touches.length !== 1 || !this.touchStartX) {
      return
    }

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - this.touchStartX)
    const deltaY = Math.abs(touch.clientY - this.touchStartY)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Determine drag direction on first significant movement
    if (!this.touchDragDirection && distance > this.touchThreshold) {
      this.touchDragDirection = deltaX > deltaY ? 'horizontal' : 'vertical'
    }

    // Only handle horizontal dragging for session movement
    if (this.touchDragDirection === 'horizontal' && distance > this.touchThreshold) {
      if (!this.isTouchDragging) {
        this.isTouchDragging = true
        this.#startTouchDrag(e)
      }

      // Update visual feedback
      this.style.transform = `translateX(${touch.clientX - this.touchStartX}px)`
      this.style.opacity = '0.8'
      this.classList.add('touch-dragging')

      // Prevent default to avoid scrolling
      e.preventDefault()
    }
  }

  #handleTouchEnd = e => {
    if (!this.isTouchDragging) {
      return
    }

    this.#endTouchDrag(e)
  }

  #handleTouchCancel = e => {
    if (this.isTouchDragging) {
      this.#endTouchDrag(e)
    }
  }

  #startTouchDrag = e => {
    // Create a visual clone for dragging feedback
    this.style.position = 'relative'
    this.style.zIndex = '1000'

    // Dispatch drag start event
    const dragStartEvent = new CustomEvent('cfb-touch-drag-start', {
      bubbles: true,
      composed: true,
      detail: {
        target: this,
        sessionId: this.#sessionId,
        touch: e.touches[0],
      },
    })
    this.dispatchEvent(dragStartEvent)
  }

  #endTouchDrag = e => {
    // Reset visual state
    this.style.transform = ''
    this.style.opacity = ''
    this.style.position = ''
    this.style.zIndex = ''
    this.classList.remove('touch-dragging')

    // Reset touch state
    this.isTouchDragging = false
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchDragDirection = null

    // Dispatch drag end event
    const dragEndEvent = new CustomEvent('cfb-touch-drag-end', {
      bubbles: true,
      composed: true,
      detail: {
        target: this,
        sessionId: this.#sessionId,
        touch: e.changedTouches ? e.changedTouches[0] : null,
      },
    })
    this.dispatchEvent(dragEndEvent)
  }
}
