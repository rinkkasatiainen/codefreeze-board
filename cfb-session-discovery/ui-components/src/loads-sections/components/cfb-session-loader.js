import { createLogger } from '@rinkkasatiainen/cfb-observability'
import CfbRetrievesSchedules from '../ports/cfb-retrieves-schedules.js'
import cfbStorage from '../ports/cfb-schedule-storage.js'
import { sessionsLoaded } from '../../events/events-loaded.js'

export class CfbSessionLoader extends HTMLElement {
  static elementName = 'cfb-session-loader'
  static definedAttributes = {
    eventId: 'data-event-id',
    updatedAt: 'data-updated-at',
  }
  #logger = createLogger()

  #eventId

  static get observedAttributes() {
    return [CfbSessionLoader.definedAttributes.eventId, CfbSessionLoader.definedAttributes.updatedAt]
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }

    if (name === CfbSessionLoader.definedAttributes.eventId) {
      this.#eventId = newValue
    }
    const sessions = await this.#loadSessions(this.#eventId)
    this.#storeSessionsToIndexDb(sessions)
    this.#updateChildren()
  }

  async #loadSessions(eventId) {
    // TODO: Implement getScheduleSessions in CfbRetrievesSchedules
    return await CfbRetrievesSchedules.getScheduleSessions(eventId)
  }

  #storeSessionsToIndexDb(sessions) {
    // Store sessions in IndexDB
    if (!sessions || sessions.length === 0) {
      return
    }
    sessions.forEach(session => {
      cfbStorage.addSession(this.#eventId, session)
    })
  }

  #updateChildren() {
    const timestamp = new Date().toISOString()
    this.querySelectorAll('.listens-schedule-updates').forEach(e => {
      e.setAttribute('data-updated-at', timestamp)
    })
    this.dispatchEvent(sessionsLoaded(this.#eventId))
  }
}
