/**
 * Schedule orchestrator that listens to session and section loaded events
 */

import { EventTypes, isSessionsLoaded, isSectionsLoaded } from '../../events/events-loaded.js'

export class CfbScheduleOrchestratorElement extends HTMLElement {
  static elementName = 'cfb-schedule-orchestrator'
  static definedAttributes = {}

  #sessionsLoaded = false
  #sectionsLoaded = false
  #eventHandler = null

  connectedCallback() {
    this.#setupEventListeners()
  }

  disconnectedCallback() {
    this.#removeEventListeners()
  }

  #setupEventListeners() {
    this.#eventHandler = this.#handleEvents.bind(this)
    document.addEventListener(EventTypes.SESSIONS_LOADED, this.#eventHandler)
    document.addEventListener(EventTypes.SECTIONS_LOADED, this.#eventHandler)
  }

  #removeEventListeners() {
    if (this.#eventHandler) {
      document.removeEventListener(EventTypes.SESSIONS_LOADED, this.#eventHandler)
      document.removeEventListener(EventTypes.SECTIONS_LOADED, this.#eventHandler)
    }
  }

  #handleEvents(event) {
    if (isSessionsLoaded(event)) {
      this.#sessionsLoaded = true
      this.#checkAndUpdateChildren()
    } else if (isSectionsLoaded(event)) {
      this.#sectionsLoaded = true
      this.#checkAndUpdateChildren()
    }
  }

  #checkAndUpdateChildren() {
    if (this.#sessionsLoaded && this.#sectionsLoaded) {
      this.#updateChildren()
    }
  }

  #updateChildren() {
    const childrenToUpdate = this.querySelectorAll('.listens-schedule-updates')
    const timestamp = Date.now()

    childrenToUpdate.forEach(child => {
      child.setAttribute('data-updated-at', timestamp.toString())
    })
  }
}
