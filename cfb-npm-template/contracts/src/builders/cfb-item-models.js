import {randomId, randomString} from './randomizer.js'

export function buildItemWith(mockWith = {}) {
  const example = {
    id: randomId(),
    name: randomString(10),
    tags: [{name: 'Tag1', type: 'default'}, {name: 'Tag2', type: 'primary'}],
  }
  return {...example, ...mockWith}
}

