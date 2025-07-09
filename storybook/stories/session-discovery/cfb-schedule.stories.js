import {CfbSchedule} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-schedule.js'

// Register the custom element
if (!customElements.get(CfbSchedule.elementName)) {
  customElements.define(CfbSchedule.elementName, CfbSchedule)
}

export default {
  title: 'Template/CFB Session Discovery/Schedule',
  component: CfbSchedule.elementName,
  parameters: {
    docs: {
      description: {
        component: 'A web component that displays schedule sections from IndexedDB. It listens to data-updated-at and data-event-id attribute changes and renders cfb-section elements for each section found in storage.'
      }
    }
  },
  argTypes: {
    'data-event-id': {
      control: 'text',
      description: 'The event ID to load sections for',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default-event' }
      }
    },
    'data-updated-at': {
      control: 'text',
      description: 'Timestamp that triggers a refresh when changed',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'none' }
      }
    }
  }
}

// Default story
export const Default = {
  args: {},
  render: (args) => {
    const element = document.createElement(CfbSchedule.elementName)
    if (args['data-event-id']) {
      element.setAttribute('data-event-id', args['data-event-id'])
    }
    if (args['data-updated-at']) {
      element.setAttribute('data-updated-at', args['data-updated-at'])
    }
    return element
  }
}

// Story with event ID
export const WithEventId = {
  args: {
    'data-event-id': 'test-event-123'
  },
  render: (args) => {
    const element = document.createElement(CfbSchedule.elementName)
    element.setAttribute('data-event-id', args['data-event-id'])
    return element
  }
}

// Interactive story
export const Interactive = {
  args: {
    'data-event-id': 'interactive-event',
    'data-updated-at': Date.now().toString()
  },
  render: (args) => {
    const container = document.createElement('div')
    container.style.padding = '20px'
    container.style.fontFamily = 'Arial, sans-serif'
    
    const title = document.createElement('h3')
    title.textContent = 'Schedule Component Demo'
    title.style.marginBottom = '20px'
    
    const description = document.createElement('p')
    description.textContent = 'This demonstrates the CfbSchedule component. Add sections to storage and trigger updates.'
    description.style.marginBottom = '20px'
    
    const controls = document.createElement('div')
    controls.style.marginBottom = '20px'
    
    const eventIdInput = document.createElement('input')
    eventIdInput.type = 'text'
    eventIdInput.placeholder = 'Event ID'
    eventIdInput.value = args['data-event-id']
    eventIdInput.style.marginRight = '10px'
    eventIdInput.style.padding = '8px'
    eventIdInput.style.width = '150px'
    
    const updateButton = document.createElement('button')
    updateButton.textContent = 'Update Schedule'
    updateButton.style.padding = '8px 16px'
    updateButton.style.backgroundColor = '#007bff'
    updateButton.style.color = 'white'
    updateButton.style.border = 'none'
    updateButton.style.borderRadius = '4px'
    updateButton.style.cursor = 'pointer'
    updateButton.style.marginRight = '10px'
    
    const addSectionButton = document.createElement('button')
    addSectionButton.textContent = 'Add Sample Section'
    addSectionButton.style.padding = '8px 16px'
    addSectionButton.style.backgroundColor = '#28a745'
    addSectionButton.style.color = 'white'
    addSectionButton.style.border = 'none'
    addSectionButton.style.borderRadius = '4px'
    addSectionButton.style.cursor = 'pointer'
    
    const status = document.createElement('div')
    status.id = 'status'
    status.style.padding = '10px'
    status.style.backgroundColor = '#f8f9fa'
    status.style.border = '1px solid #dee2e6'
    status.style.borderRadius = '4px'
    status.style.marginTop = '10px'
    status.textContent = 'Status: Ready'
    
    const element = document.createElement(CfbSchedule.elementName)
    element.setAttribute('data-event-id', args['data-event-id'])
    element.setAttribute('data-updated-at', args['data-updated-at'])
    
    // Event handlers
    updateButton.addEventListener('click', () => {
      const eventId = eventIdInput.value.trim()
      if (eventId) {
        element.setAttribute('data-event-id', eventId)
        element.setAttribute('data-updated-at', Date.now().toString())
        status.textContent = `Status: Updated schedule for event ${eventId}`
        status.style.backgroundColor = '#d4edda'
        status.style.borderColor = '#c3e6cb'
      } else {
        status.textContent = 'Status: Please enter an event ID'
        status.style.backgroundColor = '#f8d7da'
        status.style.borderColor = '#f5c6cb'
      }
    })
    
    addSectionButton.addEventListener('click', async () => {
      try {
        const eventId = eventIdInput.value.trim() || args['data-event-id']
        const section = {
          id: `section-${Date.now()}`,
          name: `Section ${Math.floor(Math.random() * 1000)}`,
          order: Math.floor(Math.random() * 10)
        }
        
        // Import and use the storage
        const {default: cfbScheduleStorage} = await import('@rinkkasatiainen/cfb-session-discovery')
        await cfbScheduleStorage.addSection(eventId, section)
        
        // Trigger update
        element.setAttribute('data-updated-at', Date.now().toString())
        
        status.textContent = `Status: Added section "${section.name}" to event ${eventId}`
        status.style.backgroundColor = '#d4edda'
        status.style.borderColor = '#c3e6cb'
      } catch (error) {
        status.textContent = `Status: Error adding section - ${error.message}`
        status.style.backgroundColor = '#f8d7da'
        status.style.borderColor = '#f5c6cb'
      }
    })
    
    // Assemble the UI
    controls.appendChild(eventIdInput)
    controls.appendChild(updateButton)
    controls.appendChild(addSectionButton)
    
    container.appendChild(title)
    container.appendChild(description)
    container.appendChild(controls)
    container.appendChild(element)
    container.appendChild(status)
    
    return container
  }
} 