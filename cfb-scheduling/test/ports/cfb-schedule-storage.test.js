import { expect } from 'chai'
import { cfbStorage } from '../../src/ports/cfb-schedule-storage.js'

describe('CFBStorage', () => {
  beforeEach(async () => {
    await cfbStorage.init()
  })


  xit('should add and retrieve a section', async () => {
    const section = { id: 'test-1', title: 'Test Section', order: 0 }
    await cfbStorage.addSection(section)
        
    const retrieved = await cfbStorage.getSection('test-1')
    expect(retrieved).to.deep.equal(section)
  })

  xit('should update a section', async () => {
    const section = { id: 'test-2', title: 'Test Section', order: 0 }
    await cfbStorage.addSection(section)
        
    section.title = 'Updated Section'
    await cfbStorage.updateSection(section)
        
    const retrieved = await cfbStorage.getSection('test-2')
    expect(retrieved.title).to.equal('Updated Section')
  })

  xit('should get all sections', async () => {
    const sections = [
      { id: 'test-3', title: 'Section 1', order: 0 },
      { id: 'test-4', title: 'Section 2', order: 1 },
    ]
        
    await Promise.all(sections.map(section => cfbStorage.addSection(section)))
        
    const retrieved = await cfbStorage.getAllSections()
    expect(retrieved).to.have.lengthOf(2)
    expect(retrieved.map(s => s.id)).to.have.members(['test-3', 'test-4'])
  })

  xit('should delete a section', async () => {
    const section = { id: 'test-5', title: 'Test Section', order: 0 }
    await cfbStorage.addSection(section)
        
    await cfbStorage.deleteSection('test-5')
        
    const retrieved = await cfbStorage.getSection('test-5')
    expect(retrieved).to.be.undefined
  })

  xit('should reorder sections', async () => {
    const sections = [
      { id: 'test-6', title: 'Section 1', order: 0 },
      { id: 'test-7', title: 'Section 2', order: 1 },
    ]
        
    await Promise.all(sections.map(section => cfbStorage.addSection(section)))
        
    // Reverse the order
    const reordered = [...sections].reverse()
    await cfbStorage.reorderSections(reordered)
        
    const retrieved = await cfbStorage.getAllSections()
    expect(retrieved[0].id).to.equal('test-7')
    expect(retrieved[1].id).to.equal('test-6')
  })
}) 
