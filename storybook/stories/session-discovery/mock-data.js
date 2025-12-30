import {buildSectionWith, buildSessionWith, WellKnown} from '@rinkkasatiainen/cfb-session-discovery-contracts'

// Export the mock data for use in handlers
const {day0Entries, day1Entries} = WellKnown.sessions
const exampleSessionEntry = buildSessionWith()

export {exampleSessionEntry, day0Entries, day1Entries}


export const sectionsForDemo = [
  buildSectionWith({
    'id': 'section-1',
    'name': 'Monday',
    'order': 0
  }),
  buildSectionWith({
    'id': 'section-2',
    'name': 'Tuesday',
    'order': 1
  }),
  buildSectionWith({
    'id': 'section-3',
    'name': 'Wednesday',
    'order': 2
  }),
  buildSectionWith({
    'id': 'section-4',
    'name': 'Thursday',
    'order': 3
  }),
  buildSectionWith({
    'id': 'section-5',
    'name': 'Friday',
    'order': 4
  })
]