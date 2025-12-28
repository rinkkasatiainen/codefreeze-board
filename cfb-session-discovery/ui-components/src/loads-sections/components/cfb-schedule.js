/**
 * A schedule component that displays sections from IndexDB
 */

import {createLogger} from '@rinkkasatiainen/cfb-observability'
import cfbScheduleStorage from '../ports/cfb-schedule-storage.js'
import {sectionsAddedToDom} from '../../events/events-loaded.js'

export class CfbSchedule extends HTMLElement {
  static elementName = 'cfb-schedule'

  static definedAttributes = {
    updatedAt: 'data-updated-at',
    eventId: 'data-event-id',
  }

  #logger = createLogger()
  #updatedAt = undefined
  #eventId = undefined

  static get observedAttributes() {
    return [CfbSchedule.definedAttributes.updatedAt, CfbSchedule.definedAttributes.eventId]
  }

  connectedCallback() {
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }
    if (name === CfbSchedule.definedAttributes.updatedAt) {
      this.#updatedAt = newValue
      this.#render()
    }
    if (name === CfbSchedule.definedAttributes.eventId) {
      this.#eventId = newValue
      this.#render()
    }
    // TODO: AkS: test this
    if(this.#eventId !== undefined && this.#updatedAt !== undefined) {
      this.#render()
      this.dispatchEvent(sectionsAddedToDom(this.#eventId))
    }
  }

  async #render() {
    try {
      // Get sections from IndexDB for the specified event
      const sections = await cfbScheduleStorage
        .getAllSections(this.#eventId || 'default-event')
      sections.sort((a, b) => a.order - b.order)

      // Clear existing content
      this.innerHTML = ''

      const board = document.createElement('div')
      board.classList.add('cfb-board')

      // Add a cfb-section for each entry
      sections.forEach(section => {
        const sectionHtml = `
        <cfb-session-scheduler
          data-section-id="${section.id}" 
          data-event-id="${this.#eventId}"
          class="listens-session-updates"
         ><cfb-section 
            data-section-id="${section.id}" 
            data-event-id="${this.#eventId}" 
            data-name="${section.name}"
          ></cfb-section
        ></cfb-session-scheduler>
        `
        board.innerHTML += sectionHtml
      })
      this.appendChild(board)
    } catch (error) {
      this.#logger.error('Error rendering schedule:', error)
      this.innerHTML = '<div>Error loading schedule</div>'
    }
  }
}
