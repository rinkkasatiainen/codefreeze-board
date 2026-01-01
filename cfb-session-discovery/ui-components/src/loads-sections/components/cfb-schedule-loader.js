import { createLogger } from '@rinkkasatiainen/cfb-observability'
import CfbRetrievesSchedules from '../ports/cfb-retrieves-schedules.js'
import cfbStorage from '../ports/cfb-schedule-storage.js'
import { sectionsLoaded } from '../../events/events-loaded.js'

/**
 * A simple schedule loader element
 */

export class CfbScheduleLoader extends HTMLElement {
  static elementName = 'cfb-schedule-loader'
  static definedAttributes = { eventId: 'data-event-id' }
  #logger = createLogger()

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
    // const timestamp = new Date().toISOString()
    // this.querySelectorAll('.listens-session-updates').forEach(e => {
    //   e.setAttribute('data-updated-at', timestamp)
    // })
    this.dispatchEvent(sectionsLoaded(this.#eventId))
  }
}

// async function tick(timeoutInMs = 100) {
//   return new Promise(resolve => {
//     setTimeout( resolve, timeoutInMs)
//   })
// }
