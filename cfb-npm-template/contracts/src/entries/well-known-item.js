export const wellKnownItems = {
  Item1: {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'First Item',
    tags: [{name: 'Important', type: 'primary'}, {name: 'New', type: 'default'}],
  },
  Item2: {
    id: '00000001-0000-0000-0000-000000000000',
    name: 'Second Item',
    tags: [{name: 'Featured', type: 'primary'}],
  },
  Item3: {
    id: '00000002-0000-0000-0000-000000000000',
    name: 'Third Item',
    tags: [{name: 'Standard', type: 'default'}],
  },
}

export const templateItems = Object.values(wellKnownItems)

