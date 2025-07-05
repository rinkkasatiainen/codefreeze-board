import {expect} from 'chai'
import exampleStorage from '../../src/storage/example-storage.js'

describe('ExampleStorage', () => {
  beforeEach(async () => {
    await exampleStorage.init()
  })

  afterEach(async () => {
    const examples = await exampleStorage.getAllExamples()
    await Promise.all(examples.map(example => exampleStorage.deleteExample(example.id)))
  })

  it('should add and retrieve an example', async () => {
    const example = {id: 'test-1', name: 'John Doe', age: 30}
    await exampleStorage.addExample(example)

    const retrieved = await exampleStorage.getExample('test-1')
    expect(retrieved).to.deep.equal(example)
  })

  it('should get all examples', async () => {
    const examples = [
      {id: 'test-2', name: 'Jane Smith', age: 25},
      {id: 'test-3', name: 'Bob Johnson', age: 35},
    ]

    await Promise.all(examples.map(example => exampleStorage.addExample(example)))

    const retrieved = await exampleStorage.getAllExamples()
    expect(retrieved).to.have.lengthOf(2)
    expect(retrieved.map(e => e.id)).to.have.members(['test-2', 'test-3'])
  })

  it('should delete an example', async () => {
    const example = {id: 'test-4', name: 'Alice Brown', age: 28}
    await exampleStorage.addExample(example)

    await exampleStorage.deleteExample('test-4')

    const retrieved = await exampleStorage.getExample('test-4')
    expect(retrieved).to.be.undefined
  })

  it('should handle multiple operations correctly', async () => {
    const example1 = {id: 'test-5', name: 'Charlie Wilson', age: 40}
    const example2 = {id: 'test-6', name: 'Diana Davis', age: 32}

    // Add examples
    await exampleStorage.addExample(example1)
    await exampleStorage.addExample(example2)

    // Verify both exist
    let allExamples = await exampleStorage.getAllExamples()
    expect(allExamples).to.have.lengthOf(2)

    // Delete one
    await exampleStorage.deleteExample('test-5')

    // Verify only one remains
    allExamples = await exampleStorage.getAllExamples()
    expect(allExamples).to.have.lengthOf(1)
    expect(allExamples[0].id).to.equal('test-6')
  })

  it('should return undefined for non-existent id', async () => {
    const retrieved = await exampleStorage.getExample('non-existent')
    expect(retrieved).to.be.undefined
  })

  it('should handle empty database', async () => {
    const retrieved = await exampleStorage.getAllExamples()
    expect(retrieved).to.be.an('array').that.is.empty
  })
}) 