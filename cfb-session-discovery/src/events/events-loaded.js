export const EventTypes = {
  SESSIONS_LOADED: 'cfb-evt-sessions-loaded',
  SECTIONS_LOADED: 'cfb-evt-sections-loaded',
}

export const sessionsLoaded = eventId => new CustomEvent(EventTypes.SESSIONS_LOADED, {
  bubbles: true,
  composed: true,
  detail: {eventId, _type: EventTypes.SESSIONS_LOADED},
})

export const isSessionsLoaded = evt =>
// eslint-disable-next-line no-underscore-dangle
  evt instanceof CustomEvent && evt.detail?._type === EventTypes.SESSIONS_LOADED

export const sectionsLoaded = eventId => new CustomEvent(EventTypes.SECTIONS_LOADED, {
  bubbles: true,
  composed: true,
  detail: {eventId, _type: EventTypes.SECTIONS_LOADED},
})

export const isSectionsLoaded = evt =>
// eslint-disable-next-line no-underscore-dangle
  evt instanceof CustomEvent && evt.detail?._type === EventTypes.SECTIONS_LOADED
