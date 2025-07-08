import CfbRetrievesSchedules from '../ports/cfb-retrieves-schedules.js'
import cfbStorage from '../ports/cfb-schedule-storage.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'

/**
 * A simple schedule loader element
 */

export class CfbScheduleLoader extends HTMLElement {
  static elementName = 'cfb-schedule-loader'
  static definedAttributes = {eventId: 'data-event-id'}
  #logger = createLogger()

  #eventId

  static get observedAttributes() {
    return [CfbScheduleLoader.definedAttributes.eventId]
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    this.#logger.warn('Should fail')
    if (newValue === oldValue) {
      return
    }

    if (name === CfbScheduleLoader.definedAttributes.eventId) {
      this.#eventId = newValue
      const sections = await this.#loadSections(this.#eventId)
      this.#storeSessionsToIndexDb(sections)
      this.#updateChildren()
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

  #updateChildren(){
    const timestamp = new Date().toISOString()
    this.querySelectorAll('.listens-schedule-updates').forEach(e => {
      e.setAttribute('data-updated-at', timestamp)
    })
  }
}
