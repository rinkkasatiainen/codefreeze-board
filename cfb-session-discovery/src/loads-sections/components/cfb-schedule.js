/**
 * A schedule component that displays sections from IndexDB
 */

import cfbScheduleStorage from '../ports/cfb-schedule-storage.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'

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
  }

  async #render() {
    try {
      // Get sections from IndexDB for the specified event
      const sections = await cfbScheduleStorage
        .getAllSections(this.#eventId || 'default-event')
      sections.sort((a, b) => a.order - b.order)

      // Clear existing content
      this.innerHTML = ''

      // Add a cfb-section for each entry
      const now = new Date().toISOString()
      sections.forEach(section => {
        const sectionHtml = `<cfb-session-loader 
          data-event-id="${this.#eventId}" 
          data-section-id="${section.id}" 
          data-updated-at="${now}"
        ><cfb-section data-section-id="${section.id}" data-name="${section.name}"></cfb-section
        ></cfb-session-loader> `
        this.innerHTML += sectionHtml
      })
    } catch (error) {
      this.#logger.error('Error rendering schedule:', error)
      this.innerHTML = '<div>Error loading schedule</div>'
    }
  }
}
