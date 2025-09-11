export const EventTypes = {
  SESSIONS_LOADED: 'cfb-evt-sessions-loaded',
  SECTIONS_LOADED: 'cfb-evt-sections-loaded',
  SECTIONS_ADDED_TO_DOM: 'cfb-evt-sections-added-to-dom',
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

export const sectionsAddedToDom = eventId => new CustomEvent(EventTypes.SECTIONS_ADDED_TO_DOM, {
  bubbles: true,
  composed: true,
  detail: {eventId, _type: EventTypes.SECTIONS_ADDED_TO_DOM},
})

export const isSectionsAddedToDom = evt =>
// eslint-disable-next-line no-underscore-dangle
  evt instanceof CustomEvent && evt.detail?._type === EventTypes.SECTIONS_ADDED_TO_DOM
