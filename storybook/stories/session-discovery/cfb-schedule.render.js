import {CfbSchedule} from '@rinkkasatiainen/cfb-session-discovery'
import cfbScheduleStorage from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'
import {Randomizer} from '../randomizer'

export function renderSchedule(args) {
  const element = document.createElement(CfbSchedule.elementName)
  if (args['data-event-id']) {
    element.setAttribute('data-event-id', args['data-event-id'])
  }
  return element
}

export function renderScheduleInteractive(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'
  
  const title = document.createElement('h3')
  title.textContent = 'Schedule Component Demo'
  title.style.marginBottom = '20px'
  
  const description = document.createElement('p')
  description.textContent = 'This demo shows the Schedule component with real-time updates. Add sections to storage and watch the component update automatically.'
  description.style.marginBottom = '20px'
  
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Enter event ID'
  input.value = args['data-event-id']
  input.style.marginBottom = '10px'
  input.style.padding = '8px'
  input.style.width = '200px'
  input.style.marginRight = '10px'
  
  const addButton = document.createElement('button')
  addButton.textContent = 'Add Sample Sections'
  addButton.style.padding = '8px 16px'
  addButton.style.backgroundColor = '#007bff'
  addButton.style.color = 'white'
  addButton.style.border = 'none'
  addButton.style.borderRadius = '4px'
  addButton.style.cursor = 'pointer'
  addButton.style.marginRight = '10px'
  
  const clearButton = document.createElement('button')
  clearButton.textContent = 'Clear Sections'
  clearButton.style.padding = '8px 16px'
  clearButton.style.backgroundColor = '#dc3545'
  clearButton.style.color = 'white'
  clearButton.style.border = 'none'
  clearButton.style.borderRadius = '4px'
  clearButton.style.cursor = 'pointer'
  clearButton.style.marginBottom = '20px'
  
  const element = document.createElement(CfbSchedule.elementName)
  element.setAttribute('data-event-id', args['data-event-id'])
  
  const status = document.createElement('div')
  status.id = 'status'
  status.style.padding = '10px'
  status.style.backgroundColor = '#f8f9fa'
  status.style.border = '1px solid #dee2e6'
  status.style.borderRadius = '4px'
  status.style.marginTop = '10px'
  status.textContent = 'Status: Initializing storage...'
  
  // Sample sections function that takes eventId as parameter
  const createSampleSections = (eventId, sectionIds = ['section-1', 'section-2', 'section-3', 'section-4', 'section-5']) => [
    { id: 'section-1', name: 'Monday', order: 0, eventId, sectionId: Randomizer.randomFromList(sectionIds) },
    { id: 'section-2', name: 'Tuesday', order: 1, eventId, sectionId: Randomizer.randomFromList(sectionIds) },
    { id: 'section-3', name: 'Wednesday', order: 2, eventId, sectionId: Randomizer.randomFromList(sectionIds) },
    { id: 'section-4', name: 'Thursday', order: 3, eventId, sectionId: Randomizer.randomFromList(sectionIds) },
    { id: 'section-5', name: 'Friday', order: 4, eventId, sectionId: Randomizer.randomFromList(sectionIds) }
  ]
  
  // Initialize storage in the background
  cfbScheduleStorage.init()
    .then(() => {
      console.log('Storage initialized successfully')
      status.textContent = 'Status: Ready to add sections'
    })
    .catch(error => {
      console.error('Storage initialization failed:', error)
      status.textContent = `❌ Error initializing storage: ${error.message}`
      status.style.backgroundColor = '#f8d7da'
      status.style.borderColor = '#f5c6cb'
    })
  
  addButton.addEventListener('click', async () => {
    try {
      console.log('Add button clicked')
      status.textContent = 'Status: Adding sections...'
      status.style.backgroundColor = '#f8f9fa'
      status.style.borderColor = '#dee2e6'
      
      const eventId = input.value.trim() || 'demo-event-123'
      console.log('Event ID:', eventId)
      
      const sampleSections = createSampleSections(eventId)
      console.log('Sample sections:', sampleSections)
      
      // Add sample sections
      const addPromises = sampleSections.map(section =>
        cfbScheduleStorage.addSection(eventId, section)
      )
      await Promise.all(addPromises)
      
      console.log('Sections added successfully')
      status.textContent = `✅ Added ${sampleSections.length} sections for event: ${eventId}`
      status.style.backgroundColor = '#d4edda'
      status.style.borderColor = '#c3e6cb'
    } catch (error) {
      console.error('Error adding sections:', error)
      status.textContent = `❌ Error adding sections: ${error.message}`
      status.style.backgroundColor = '#f8d7da'
      status.style.borderColor = '#f5c6cb'
    }
  })
  
  clearButton.addEventListener('click', async () => {
    try {
      console.log('Clear button clicked')
      status.textContent = 'Status: Clearing sections...'
      status.style.backgroundColor = '#f8f9fa'
      status.style.borderColor = '#dee2e6'
      
      const eventId = input.value.trim() || 'demo-event-123'
      console.log('Event ID:', eventId)
      
      const sections = await cfbScheduleStorage.getAllSections(eventId)
      console.log('Found sections to delete:', sections)
      
      const deletePromises = sections.map(section =>
        cfbScheduleStorage.deleteSection(eventId, section.id)
      )
      await Promise.all(deletePromises)
      
      console.log('Sections cleared successfully')
      status.textContent = `🗑️ Cleared ${sections.length} section(s) for event: ${eventId}`
      status.style.backgroundColor = '#fff3cd'
      status.style.borderColor = '#ffeaa7'
    } catch (error) {
      console.error('Error clearing sections:', error)
      status.textContent = `❌ Error clearing sections: ${error.message}`
      status.style.backgroundColor = '#f8d7da'
      status.style.borderColor = '#f5c6cb'
    }
  })
  
  const controls = document.createElement('div')
  controls.appendChild(input)
  controls.appendChild(addButton)
  controls.appendChild(clearButton)
  
  container.appendChild(title)
  container.appendChild(description)
  container.appendChild(controls)
  container.appendChild(element)
  container.appendChild(status)
  
  return container
} 