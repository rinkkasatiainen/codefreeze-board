import {AssertionError} from 'chai'

export const withClearableStorage = storage => {
  storage.clearAll = async function(eventId) {
    const examples = await this.getAllSections(eventId)
    const deletePromises = examples.map(example => this.deleteSection(eventId, example.id))
    await Promise.all(deletePromises)
    delete storage.clearAll
  }
  return storage
}

function isArray(value) {
  return Array.isArray(value)
}

export function ensureSingle(arr, predicate = () => true) {
  if (!(isArray(arr) && arr.length === 1)) {
    throw new AssertionError('Expected array to have exactly one element, but got: ' + arr.join(', '))
  }
  if(arr.filter(predicate).length !== 1){
    throw new AssertionError('expected the single element to match predicate')
  }
  return arr[0]
}
