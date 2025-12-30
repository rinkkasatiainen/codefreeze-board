import {CfbSessionLoader} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-session-loader'
import cfbScheduleStorage from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'

export function renderSessionLoader(args) {
  const element = document.createElement(CfbSessionLoader.elementName)
  
  if (args['data-event-id']) {
    element.setAttribute('data-event-id', args['data-event-id'])
  }
  if (args['data-updated-at']) {
    element.setAttribute('data-updated-at', args['data-updated-at'])
  }
  
  return element
}

export function renderSessionLoaderInteractive(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'
  
  const title = document.createElement('h3')
  title.textContent = 'Session Loader Component Demo'
  title.style.marginBottom = '20px'
  
  const description = document.createElement('p')
  description.textContent = 'This demo shows the Session Loader component. It fetches sessions from the API and stores them in IndexedDB, then updates child components that listen for schedule updates.'
  description.style.marginBottom = '20px'
  
  const controls = document.createElement('div')
  controls.style.marginBottom = '20px'
  
  const eventIdLabel = document.createElement('label')
  eventIdLabel.textContent = 'Event ID: '
  eventIdLabel.style.marginRight = '10px'
  
  const eventIdInput = document.createElement('input')
  eventIdInput.type = 'text'
  eventIdInput.value = args['data-event-id'] || 'demo-event-123'
  eventIdInput.style.padding = '8px'
  eventIdInput.style.marginRight = '20px'
  eventIdInput.style.width = '200px'
  
  const loadButton = document.createElement('button')
  loadButton.textContent = 'Load Sessions'
  loadButton.style.padding = '8px 16px'
  loadButton.style.backgroundColor = '#007bff'
  loadButton.style.color = 'white'
  loadButton.style.border = 'none'
  loadButton.style.borderRadius = '4px'
  loadButton.style.cursor = 'pointer'
  loadButton.style.marginRight = '10px'
  
  const clearButton = document.createElement('button')
  clearButton.textContent = 'Clear Sessions'
  clearButton.style.padding = '8px 16px'
  clearButton.style.backgroundColor = '#dc3545'
  clearButton.style.color = 'white'
  clearButton.style.border = 'none'
  clearButton.style.borderRadius = '4px'
  clearButton.style.cursor = 'pointer'
  
  const element = document.createElement(CfbSessionLoader.elementName)
  element.setAttribute('data-event-id', eventIdInput.value)
  
  // Add a child component that listens for updates
  const childComponent = document.createElement('div')
  childComponent.className = 'listens-schedule-updates'
  childComponent.setAttribute('data-updated-at', '')
  childComponent.style.padding = '10px'
  childComponent.style.backgroundColor = '#f8f9fa'
  childComponent.style.border = '1px solid #dee2e6'
  childComponent.style.borderRadius = '4px'
  childComponent.style.marginTop = '10px'
  childComponent.textContent = 'Child component waiting for updates... (check the data-updated-at attribute)'
  
  element.appendChild(childComponent)
  
  const status = document.createElement('div')
  status.id = 'status'
  status.style.padding = '10px'
  status.style.backgroundColor = '#f8f9fa'
  status.style.border = '1px solid #dee2e6'
  status.style.borderRadius = '4px'
  status.style.marginTop = '10px'
  status.textContent = 'Status: Ready to load sessions'
  
  // Initialize storage
  cfbScheduleStorage.init()
    .then(() => {
      console.log('Storage initialized successfully')
      status.textContent = 'Status: Storage ready'
    })
    .catch(error => {
      console.error('Storage initialization failed:', error)
      status.textContent = `❌ Error initializing storage: ${error.message}`
      status.style.backgroundColor = '#f8d7da'
      status.style.borderColor = '#f5c6cb'
    })
  
  loadButton.addEventListener('click', async () => {
    try {
      status.textContent = 'Status: Loading sessions...'
      status.style.backgroundColor = '#f8f9fa'
      status.style.borderColor = '#dee2e6'
      
      const eventId = eventIdInput.value.trim()
      element.setAttribute('data-event-id', eventId)
      
      // Simulate loading sessions by updating the timestamp
      const timestamp = new Date().toISOString()
      element.setAttribute('data-updated-at', timestamp)
      
      status.textContent = `✅ Sessions loaded for event: ${eventId}`
      status.style.backgroundColor = '#d4edda'
      status.style.borderColor = '#c3e6cb'
    } catch (error) {
      console.error('Error loading sessions:', error)
      status.textContent = `❌ Error loading sessions: ${error.message}`
      status.style.backgroundColor = '#f8d7da'
      status.style.borderColor = '#f5c6cb'
    }
  })
  
  clearButton.addEventListener('click', async () => {
    try {
      status.textContent = 'Status: Clearing sessions...'
      status.style.backgroundColor = '#f8f9fa'
      status.style.borderColor = '#dee2e6'
      
      const eventId = eventIdInput.value.trim()
      
      // Clear sessions from storage
      const sessions = await cfbScheduleStorage.getAllSessions(eventId)
      const deletePromises = sessions.map(session =>
        cfbScheduleStorage.deleteSession(eventId, session.id)
      )
      await Promise.all(deletePromises)
      
      status.textContent = `🗑️ Cleared ${sessions.length} session(s) for event: ${eventId}`
      status.style.backgroundColor = '#fff3cd'
      status.style.borderColor = '#ffeaa7'
    } catch (error) {
      console.error('Error clearing sessions:', error)
      status.textContent = `❌ Error clearing sessions: ${error.message}`
      status.style.backgroundColor = '#f8d7da'
      status.style.borderColor = '#f5c6cb'
    }
  })
  
  controls.appendChild(eventIdLabel)
  controls.appendChild(eventIdInput)
  controls.appendChild(loadButton)
  controls.appendChild(clearButton)
  
  container.appendChild(title)
  container.appendChild(description)
  container.appendChild(controls)
  container.appendChild(element)
  container.appendChild(status)
  
  return container
}
