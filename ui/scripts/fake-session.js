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

      // Dispatch custom event for move start
      const moveEvent = new CustomEvent('cfb-move-session', {
        bubbles: true,
        composed: true,
        detail: {session: this}
      })
      this.dispatchEvent(moveEvent)
    }

    this.handleDragEnd = (e) => {
      this.style.opacity = '1'
      this.classList.remove('dragging')
      document.querySelectorAll('.cfb-session').forEach(session => {
        session.classList.remove('over')
      })
      CFBSession.draggedItem = null
    }

    this.handleDragOver = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'

      // Dispatch on-top event
      const onTopEvent = new CustomEvent('cfb-session-on-top', {
        bubbles: true,
        composed: true,
        detail: {
          session: this,
          newPosition: 0,  // Initial position
          target: this
        }
      })
      this.dispatchEvent(onTopEvent)
      return false
    }

    this.handleDrop = (e) => {
      // return false;
      e.preventDefault()
      e.stopPropagation()
      const target = e.target

      if (CFBSession.draggedItem !== this) {
        const column = this.closest('.cfb-column')
        const sessions = Array.from(column.querySelectorAll('.cfb-session'))
        const droppedIndex = sessions.indexOf(target)

        // Dispatch custom event for move completion
        const movedEvent = new CustomEvent('cfb-moved-session', {
          bubbles: true,
          composed: true,
          detail: {
            session: CFBSession.draggedItem,
            newPosition: droppedIndex,
            target: this
          }
        })
        this.dispatchEvent(movedEvent)
      }

      return false
    }
  }

  connectedCallback() {
    this.setAttribute('draggable', 'true')
    this.addEventListener('dragstart', this.handleDragStart)
    this.addEventListener('dragend', this.handleDragEnd)
    this.addEventListener('dragover', this.handleDragOver)
    this.addEventListener('drop', this.handleDrop)
  }
}