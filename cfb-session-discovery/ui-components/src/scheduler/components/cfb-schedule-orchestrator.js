/**
 * Schedule orchestrator that listens to session and section loaded events
 */

import { EventTypes, isSessionsLoaded, isSectionsLoaded, isSectionsAddedToDom } from '../../events/events-loaded.js'

export class CfbScheduleOrchestratorElement extends HTMLElement {
  static elementName = 'cfb-schedule-orchestrator'
  static definedAttributes = {}

  #sessionsLoadedToIndexDb = false
  #sectionsLoadedToIndexDb = false
  #sectionsOnDom = false
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
    document.addEventListener(EventTypes.SECTIONS_ADDED_TO_DOM, this.#eventHandler)
  }

  #removeEventListeners() {
    if (this.#eventHandler) {
      document.removeEventListener(EventTypes.SESSIONS_LOADED, this.#eventHandler)
      document.removeEventListener(EventTypes.SECTIONS_LOADED, this.#eventHandler)
      document.removeEventListener(EventTypes.SECTIONS_ADDED_TO_DOM, this.#eventHandler)
    }
  }

  #handleEvents(event) {
    if (isSessionsLoaded(event)) {
      this.#sessionsLoadedToIndexDb = true
      this.#checkAndUpdateChildren()
    } else if (isSectionsLoaded(event)) {
      this.#sectionsLoadedToIndexDb = true
      this.#updateSections(event.detail.eventId)
    } else if (isSectionsAddedToDom(event)) {
      this.#sectionsOnDom = true
      this.#checkAndUpdateChildren()
    }
  }

  #updateSections(eventId) {
    const childrenToUpdate = this.querySelectorAll('.listens-schedule-updates')
    const timestamp = Date.now()

    childrenToUpdate.forEach(child => {
      child.setAttribute('data-updated-at', timestamp.toString())
      child.setAttribute('data-event-id', eventId)
    })
  }
  #checkAndUpdateChildren() {
    if (this.#sessionsLoadedToIndexDb && this.#sectionsOnDom) {
      this.updateSessions()
    }
  }

  updateSessions() {
    const childrenToUpdate = this.querySelectorAll('.listens-session-updates')
    const timestamp = Date.now()

    childrenToUpdate.forEach(child => {
      child.setAttribute('data-updated-at', timestamp.toString())
    })
  }
}
