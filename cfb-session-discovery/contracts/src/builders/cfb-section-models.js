import { randomId, randomString } from './randomizer.js'

export function buildSectionWith(mockWith = {}) {
  const example = { id: randomId(), name: randomString(10) , order: 0, date: '2025-01-12' }
  return { ...example, ...mockWith }
}

export function buildSessionWith(mockWith = {}) {
  const example = {
    id: crypto.randomUUID(),
    name: `Name: ${randomString(10)}`,
    description: 'Test Description ' + randomString(10) ,
    sectionId: crypto.randomUUID(),
    order: 0,
    tags: [{ name: 'Test', type: 'blue' }],
    speakers: [{ name: 'Test Speaker', initials: 'TS' }],
  }
  return { ...example, ...mockWith }
}
