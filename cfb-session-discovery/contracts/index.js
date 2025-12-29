import {codefreeze2025} from './src/entries/well-known-section.js'
import {day0Entries, day1Entries} from './src/entries/session-entry.js'

export {sectionSchema, sessionSchema} from './src/schemas/section-schema.js'
export {buildSessionWith, buildSectionWith} from './src/builders/cfb-section-models.js'

export const WellKnown = {
  section: {codefreeze2025}, // TODO: remove
  sections: {codefreeze2025},
  sessions: {day0Entries, day1Entries}
}