export const exampleSessionEntry = {
  id: crypto.randomUUID(),
  name: 'Session 1',
  description: 'Description 1',
  sectionId: crypto.randomUUID(),
  order: 0,
  tags: [{name: 'tag1', type: 'purple'}, {name: 'tag2', type: 'blue'}],
  speakers: [{name: 'John Doe', initial: 'JD'}, {name: 'Jane Smith', initials: 'JS'}],
}

