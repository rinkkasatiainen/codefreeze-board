/**
 * A section component that displays a column with title and content area
 */

export class CfbSection extends HTMLElement {
  static elementName = 'cfb-section'

  static definedAttributes = {
    name: 'data-name',
    sectionId: 'data-section-id',
    eventId: 'data-event-id',
  }

  #name = undefined
  #sectionId = undefined
  #eventId = undefined

  static get observedAttributes() {
    return [CfbSection.definedAttributes.name,
      CfbSection.definedAttributes.sectionId,
      CfbSection.definedAttributes.eventId]
  }

  constructor() {
    super()
    this.addEventListener('cfb-moved-session', this.handleSessionMoved.bind(this))
    this.addEventListener('cfb-session-on-top', this.addADropArea.bind(this))
    this.addEventListener('cfb-session-on-top-title', this.addADropAreaTitle.bind(this))
    this.addEventListener('mouseleave', this.handleSessionHoverOff.bind(this))
    this.addEventListener('mouseout', this.handleSessionHoverOff.bind(this))
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }
    if (name === CfbSection.definedAttributes.name) {
      this.#name = newValue
      this.#render()
    }
    if (name === CfbSection.definedAttributes.sectionId) {
      this.#sectionId = newValue
      this.#render()
    }
    if (name === CfbSection.definedAttributes.eventId) {
      this.#eventId = newValue
      this.#render()
    }
  }

  #render() {
    const name = this.#name || 'Untitled'

    this.innerHTML = `<cfb-column-title>
        <h2 class="cfb-column__title">${name}</h2>
      </cfb-column-title>
      <section class="cfb-column" role="region" aria-label="${name} column"></section>`

    // Add event listeners to the newly created elements
    this.querySelectorAll('section.cfb-column').forEach(e =>
      e.addEventListener('dragleave', this.handleSessionHoverOff.bind(this)),
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

  handleSessionHoverOff() {
    this.removeDropArea()
  }

  removeDropArea() {
    const existingPlaceholders = document.querySelectorAll('.cfb-session-placeholder')
    existingPlaceholders.forEach(placeholder => {
      placeholder.remove()
    })
  }
}
