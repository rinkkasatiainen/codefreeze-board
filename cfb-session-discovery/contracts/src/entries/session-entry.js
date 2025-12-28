/* eslint-disable @stylistic/max-len */
const sectionIdForDay0 = '00000000-0000-0000-0000-000000000000'
const sectionIdForDay1 = '00000001-0000-0000-0000-000000000000'

export const exampleSessionEntry = {
  id: crypto.randomUUID(),
  name: 'Session 1',
  description: 'Description 1',
  sectionId: crypto.randomUUID(),
  order: 0,
  tags: [{name: 'tag1', type: 'purple'}, {name: 'tag2', type: 'blue'}],
  speakers: [{name: 'John Doe', initials: 'JD'}, {name: 'Jane Smith', initials: 'JS'}],
}

export const day0Entries = [
  {
    id: 'ecea7799-2a69-4b05-86f5-5113f3428382',
    name: 'AY601 HEL - IVL 6:45 - 8:30',
    description: '',
    sectionId: sectionIdForDay0,
    order: 0,
    tags: [{name: 'Travel', type: 'yellow'} ],
    speakers: [{name: 'John Doe', initials: 'JD'}, {name: 'Jane Smith', initials: 'JS'}],
  },
]

export const day1Entries = [
  {
    id: 'cc28e252-93c2-415c-baeb-6f12f3847bf7',
    name: '800 | The Morning Dip | Hotel Ground Floor',
    description: `Never ice bathe alone.
Use the rails: The icy surface can be slippery, and falling in makes getting out extremely difficult.
Keep your head above water (especially if you're a beginner): Submerging your head can restrict blood flow to the brain and cause you to faint. This also applies to applying ice to your head or neck in a sauna—avoid doing so.
Relax and breathe: The initial shock subsides quickly.
# Why Ice Bathing?
Ice baths are thought to offer several potential benefits, primarily centered around aiding recovery and influencing physiological processes. They may help reduce muscle soreness and inflammation by constricting blood vessels, limiting inflammatory response. Ice baths can also impact the central nervous system, potentially improving sleep, and the sudden exposure to cold triggers the release of endorphins, which can lead to improved mood. Some proponents suggest potential benefits like enhanced circulation and a boosted immune system, though more research is needed to confirm these.`,
    sectionId: sectionIdForDay1,
    order: 0,
    tags: [{name: 'Outdoor Activity', type: 'cyan'} ],
    speakers: [{name: 'John Doe', initials: 'JD'}, {name: 'Jane Smith', initials: 'JS'}],
  },
]

export const allSessions = {
  sectionIdForDay0: day0Entries ,
  sectionIdForDay1: day1Entries ,
}
