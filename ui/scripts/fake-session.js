export class CFBSession extends HTMLElement {
  static draggedItem = null

  constructor() {
    super()

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
  }

  connectedCallback() {
    this.setAttribute('draggable', 'true')
    this.addEventListener('dragstart', this.handleDragStart)
    this.addEventListener('dragend', this.handleDragEnd)
    this.addEventListener('dragover', this.handleDragOver)
  }
}