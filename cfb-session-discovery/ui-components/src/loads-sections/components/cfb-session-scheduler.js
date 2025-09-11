/**
 * A session loader component that fetches and displays sessions for a section
 */

import cfbScheduleStorage from '../ports/cfb-schedule-storage.js'
import {createLogger} from '@rinkkasatiainen/cfb-observability'

export class CfbSessionScheduler extends HTMLElement {
  static elementName = 'cfb-session-scheduler'

  static definedAttributes = {
    eventId: 'data-event-id',
    sectionId: 'data-section-id',
    updatedAt: 'data-updated-at',
  }

  #logger = createLogger()
  #eventId = undefined
  #sectionId = undefined
  #updatedAt = undefined

  static get observedAttributes() {
    return [
      CfbSessionScheduler.definedAttributes.eventId,
      CfbSessionScheduler.definedAttributes.sectionId,
      CfbSessionScheduler.definedAttributes.updatedAt,
    ]
  }

  connectedCallback() {
    this.#render()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) {
      return
    }

    if (name === CfbSessionScheduler.definedAttributes.sectionId) {
      this.#sectionId = newValue
      this.#render()
    }
    if (name === CfbSessionScheduler.definedAttributes.eventId) {
      this.#eventId = newValue
      this.#render()
    }
    if (name === CfbSessionScheduler.definedAttributes.updatedAt) {
      this.#updatedAt = newValue
      this.#render()
    }
  }

  async #render() {
    if (!this.#eventId || !this.#updatedAt || !this.#sectionId) {
      return
    }

    try {
      // Fetch sessions for the event and section
      const sessions = await this.#fetchSessions(this.#eventId, this.#sectionId)

      const groupBy = (array, key) => array.reduce((result, item) => {
        result[item[key]] = [...(result[item[key]] || []), item]
        return result
      }, {})
      const sectionElement = this.querySelector(`cfb-section[data-section-id='${this.#sectionId}'] > section`)
      if (!sectionElement) {
        return
      }
      sectionElement.innerHTML = ''

      // Group sessions by sectionId
      const groupedSessions = groupBy(sessions, 'sectionId')

      // Log each section ID and sort sessions within groups
      Object.entries(groupedSessions).forEach(([sectionId, sectionSessions]) => {
        if(sectionId !== this.#sectionId) {
          return
        }
        const sessionsInOrder = [...sectionSessions.sort((a, b) => a.order - b.order)]

        // Add each session as a child of the section
        sessionsInOrder.forEach(session => {
          const sessionElement = this.#createSessionElement(session)
          sectionElement.appendChild(sessionElement)
        })
      })
    } catch (error) {
      this.#logger.error('Error rendering sessions:', error)
    }
  }

  async #fetchSessions(eventId, sectionId) {
    try {
      return await cfbScheduleStorage.getAllSessionsForSection(eventId, sectionId)
    } catch (error) {
      this.#logger.error('Error fetching sessions:', error)
      return []
    }
  }

  #createSessionElement(session) {
    const sessionElement = document.createElement('cfb-session')
    sessionElement.setAttribute('data-session-id', session.id)

    const tagsHtml = session.tags.map(tag =>
      `<span class="cfb-tag cfb-tag--${tag.type}">${tag.name}</span>`,
    ).join('')

    const avatarsHtml = session.speakers.map(speaker =>
      `<div class="cfb-avatar" aria-label="${speaker.name}">${speaker.initial || speaker.initials}</div>`,
    ).join('')

    sessionElement.innerHTML = `
      <article class="cfb-card cfb-card--travel" role="article">
        <header class="cfb-card__header">
          <span class="cfb-card__title">${session.name}</span>
          <button class="cfb-card__menu" aria-label="Card options">
            <span class="cfb-card__menu-icon"></span>
          </button>
        </header>
        <div class="cfb-card__tags">
          ${tagsHtml}
        </div>
        <footer class="cfb-card__footer">
          <div class="cfb-avatars" aria-label="Attending team members">
            ${avatarsHtml}
          </div>
        </footer>
      </article>
    `

    return sessionElement
  }
}
