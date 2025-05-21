import {CfbRetrievesSchedules} from '../ports/cfb-retrieves-schedules.js'
import cfbStorage from '../ports/cfb-schedule-storage.js'

/**
 * A simple schedule loader element
 */

export class CfbScheduleLoader extends HTMLElement {
  static elementName = 'cfb-schedule-loader'
  static definedAttributes = {eventId: 'event-id'}

  #eventId

  static get observedAttributes() {
    return [CfbScheduleLoader.definedAttributes.eventId]
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }

    if (name === CfbScheduleLoader.definedAttributes.eventId) {
      this.#eventId = newValue
      const sections = await this.#loadSections(this.#eventId)
      this.#storeSessionsToIndexDb(sections)
    }
  }

  async #loadSections(eventId) {
    return await CfbRetrievesSchedules.getScheduleSections(eventId)
  }

  #storeSessionsToIndexDb(sections) {
    // Store sections in IndexDB
    if (!sections || sections.length === 0) {
      return
    }
    sections.forEach(section => {
      cfbStorage.addSection(this.#eventId, section)
    })
  }
}
