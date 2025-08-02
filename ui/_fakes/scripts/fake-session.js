export class CFBSession extends HTMLElement {
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
    this.handleDragStart = (e) => {
      CFBSession.draggedItem = this
      this.style.opacity = '0.5'
      this.classList.add('dragging')
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/html', this.innerHTML)
    }

    this.handleDragEnd = (e) => {
      this.style.opacity = '1'
      this.classList.remove('dragging')
      document.querySelectorAll('.cfb-session').forEach(session => {
        session.classList.remove('over')
      })
      CFBSession.draggedItem = null
      const movedEvent = new CustomEvent('cfb-moved-session', {
        bubbles: true,
        composed: true,
        detail: {
          target: this
        }
      })
      this.dispatchEvent(movedEvent)
    }

    this.handleDragOver = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      // Dispatch on-top event
      const onTopEvent = new CustomEvent('cfb-session-on-top', {
        bubbles: true,
        composed: true,
        detail: {
          target: this
        }
      })
      this.dispatchEvent(onTopEvent)
      return false
    }

    // Touch event handlers
    this.handleTouchStart = (e) => {
      if (e.touches.length !== 1) return // Only handle single touch
      
      const touch = e.touches[0]
      this.touchStartX = touch.clientX
      this.touchStartY = touch.clientY
      this.isTouchDragging = false
      this.touchDragDirection = null
    }

    this.handleTouchMove = (e) => {
      if (e.touches.length !== 1) return
      
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - this.touchStartX)
      const deltaY = Math.abs(touch.clientY - this.touchStartY)
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Determine drag direction on first significant movement
      if (!this.touchDragDirection && distance > this.touchThreshold) {
        this.touchDragDirection = deltaX > deltaY ? 'horizontal' : 'vertical'
      }

      // If we're dragging vertically, prevent default to avoid scrolling
      if (this.touchDragDirection === 'vertical' && distance > this.touchThreshold) {
        e.preventDefault()
        
        // Start touch dragging if not already started
        if (!this.isTouchDragging) {
          this.startTouchDrag(e)
        }
        
        // Update touch drag position
        this.updateTouchDragPosition(touch)
      }
    }

    this.handleTouchEnd = (e) => {
      if (this.isTouchDragging) {
        this.endTouchDrag(e)
      }
      
      // Reset touch state
      this.isTouchDragging = false
      this.touchDragDirection = null
    }

    this.startTouchDrag = (e) => {
      this.isTouchDragging = true
      CFBSession.draggedItem = this
      this.style.opacity = '0.5'
      this.classList.add('dragging')
      
      // Create a ghost element for visual feedback
      this.createTouchDragGhost()
    }

    this.updateTouchDragPosition = (touch) => {
      if (this.touchDragGhost) {
        this.touchDragGhost.style.transform = `translate(${touch.clientX - this.touchStartX}px, ${touch.clientY - this.touchStartY}px)`
      }
      
      // Find drop target
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
      const sessionBelow = elementBelow?.closest('cfb-session')
      
      if (sessionBelow && sessionBelow !== this) {
        // Dispatch on-top event to the session below
        const onTopEvent = new CustomEvent('cfb-session-on-top', {
          bubbles: true,
          composed: true,
          detail: {
            target: sessionBelow
          }
        })
        sessionBelow.dispatchEvent(onTopEvent)
      }
    }

    this.endTouchDrag = (e) => {
      this.style.opacity = '1'
      this.classList.remove('dragging')
      document.querySelectorAll('.cfb-session').forEach(session => {
        session.classList.remove('over')
      })
      
      // Remove ghost element
      this.removeTouchDragGhost()
      
      CFBSession.draggedItem = null
      
      // Dispatch moved event
      const movedEvent = new CustomEvent('cfb-moved-session', {
        bubbles: true,
        composed: true,
        detail: {
          target: this
        }
      })
      this.dispatchEvent(movedEvent)
    }

    this.createTouchDragGhost = () => {
      this.touchDragGhost = this.cloneNode(true)
      this.touchDragGhost.classList.add('cfb-touch-drag-ghost')
      this.touchDragGhost.style.position = 'fixed'
      this.touchDragGhost.style.top = '0'
      this.touchDragGhost.style.left = '0'
      this.touchDragGhost.style.width = `${this.offsetWidth}px`
      this.touchDragGhost.style.height = `${this.offsetHeight}px`
      this.touchDragGhost.style.zIndex = '1000'
      this.touchDragGhost.style.pointerEvents = 'none'
      this.touchDragGhost.style.opacity = '0.8'
      this.touchDragGhost.style.transform = 'translate(0, 0)'
      
      document.body.appendChild(this.touchDragGhost)
    }

    this.removeTouchDragGhost = () => {
      if (this.touchDragGhost) {
        this.touchDragGhost.remove()
        this.touchDragGhost = null
      }
    }
  }

  connectedCallback() {
    this.setAttribute('draggable', 'true')
    
    // Mouse events
    this.addEventListener('dragstart', this.handleDragStart)
    this.addEventListener('dragend', this.handleDragEnd)
    this.addEventListener('dragover', this.handleDragOver)
    
    // Touch events
    this.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    this.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    this.addEventListener('touchend', this.handleTouchEnd, { passive: false })
  }

  disconnectedCallback() {
    this.removeTouchDragGhost()
  }
}