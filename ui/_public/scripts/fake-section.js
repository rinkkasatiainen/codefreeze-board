export class CFBSection extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('cfb-moved-session', this.handleSessionMoved.bind(this))
    this.addEventListener('cfb-session-on-top', this.addADropArea.bind(this))
    this.addEventListener('cfb-session-on-top-title', this.addADropAreaTitle.bind(this))
    this.addEventListener('mouseleave', this.handleSessionHoverOff.bind(this))
    this.addEventListener('mouseout', this.handleSessionHoverOff.bind(this))
    this.querySelectorAll('section.cfb-column').forEach(e =>
      e.addEventListener('dragleave', this.handleSessionHoverOff.bind(this))
    )
  }

  handleSessionMoved(e) {
    e.preventDefault()
    e.stopPropagation()
    const targetItem = e.detail.target

    const allColumns = document.querySelectorAll('.cfb-column')
    const column = Array.from(allColumns).find(col => col.querySelector('.cfb-session-placeholder'))
    const dropArea = column?.querySelector('.cfb-session-placeholder')

    if (!dropArea) {
      return
    }
    column.insertBefore(targetItem, dropArea)

    this.removeDropArea()
    return false
  }

  addADropAreaTitle(e) {
    e.preventDefault()
    e.stopPropagation()

    const target = e.detail.target
    const column = this.querySelector('.cfb-column')

    // Remove any existing placeholder first
    this.removeDropArea()

    // Create new placeholder
    const placeholder = document.createElement('cfb-drop-area')
    placeholder.className = 'cfb-session-placeholder'

    // Insert placeholder at the target position
    column.insertBefore(placeholder, column.firstChild)

    return false
  }
  addADropArea(e) {
    e.preventDefault()
    e.stopPropagation()

    const target = e.detail.target
    const column = this.querySelector('.cfb-column')

    // Remove any existing placeholder first
    this.removeDropArea()

    // Create new placeholder
    const placeholder = document.createElement('cfb-drop-area')
    placeholder.className = 'cfb-session-placeholder'

    // Insert placeholder at the target position
    if (target.nextSibling) {
      column.insertBefore(placeholder, target.nextSibling)
    } else {
      column.appendChild(placeholder)
    }

    return false
  }

  handleSessionHoverOff(e) {
    this.removeDropArea()
  }

  removeDropArea() {
    const existingPlaceholders = document.querySelectorAll('.cfb-session-placeholder')
    existingPlaceholders.forEach(placeholder => {
      placeholder.remove()
    })
  }
}