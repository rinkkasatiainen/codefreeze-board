export class CFBSection extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('cfb-move-session', this.handleSessionMove.bind(this))
    this.addEventListener('cfb-moved-session', this.handleSessionMoved.bind(this))
    this.addEventListener('cfb-session-on-top', this.handleSessionOnTop.bind(this))
    this.addEventListener('mouseout', this.handleSessionHoverOff.bind(this))
  }

  handleSessionMove(e) {
  }

  handleSessionMoved(e) {
    e.preventDefault()
    e.stopPropagation()
    const target = e.target

    const draggedItem = e.detail.session
    const targetItem = e.detail.target
    const column = this.querySelector('.cfb-column')
    const sessions = Array.from(column.querySelectorAll('.cfb-session'))
    const draggedIndex = sessions.indexOf(draggedItem)
    const droppedIndex = e.detail.newPosition

    if (draggedIndex < droppedIndex) {
      column.insertBefore(draggedItem, targetItem)
    } else {
      column.insertBefore(draggedItem, target)
    }

    // Remove any existing placeholder
    this.removePlaceholder()
    // TODO: remove all placeholders

    return false
  }

  spot = null

  handleSessionOnTop(e) {
    e.preventDefault()
    e.stopPropagation()

    const target = e.detail.target
    if (target === this.spot) {
      return
    }

    this.spot = target
    const column = this.querySelector('.cfb-column')

    // Remove any existing placeholder first
    this.removePlaceholder()

    // Create new placeholder
    const placeholder = document.createElement('cfb-drop-area')
    placeholder.className = 'cfb-session-placeholder'

    const fn = (target) => target.querySelector('cfb-session')

    // Insert placeholder at the target position
    if (target.nextSibling) {
      console.log('if', target, e, fn(target), target.nextSibling)
      column.insertBefore(placeholder, target.nextSibling)
    } else {
      console.log('else', fn(target))
      column.appendChild(placeholder)
    }

    return false
  }

  handleSessionHoverOff(e) {
    if (e.target === this) {
      this.removePlaceholder()
    }
  }

  removePlaceholder() {
    const existingPlaceholders = document.querySelectorAll('.cfb-session-placeholder')
    existingPlaceholders.forEach(placeholder => {
      placeholder.remove()
    })
  }
}