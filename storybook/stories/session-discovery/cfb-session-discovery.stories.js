import {SessionDiscoveryModule} from '@rinkkasatiainen/cfb-session-discovery'
import {CfbScheduleLoader} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-schedule-loader.js'

const module = new SessionDiscoveryModule()
module.configure()
module.activate()
module.run()

export default {
  title: 'Template/CFB Session Discovery/Schedule Loader',
  component: CfbScheduleLoader.elementName,
  parameters: {
    docs: {
      description: {
        component: 'A web component that loads schedule sections for a given event ID and stores them in IndexedDB. It fetches data from an API endpoint and falls back to default sections if the API is unavailable.'
      }
    }
  },
  argTypes: {
    'data-event-id': {
      control: 'text',
      description: 'The event ID to load schedules for',
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
    const element = document.createElement(CfbScheduleLoader.elementName)
    if (args['data-event-id']) {
      element.setAttribute('data-event-id', args['data-event-id'])
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
    const element = document.createElement(CfbScheduleLoader.elementName)
    element.setAttribute('data-event-id', args['data-event-id'])
    return element
  }
}

// Interactive story
export const Interactive = {
  args: {
    'data-event-id': 'interactive-event'
  },
  render: (args) => {
    const container = document.createElement('div')
    container.style.padding = '20px'
    container.style.fontFamily = 'Arial, sans-serif'

    const title = document.createElement('h3')
    title.textContent = 'Schedule Loader Demo'
    title.style.marginBottom = '20px'

    const description = document.createElement('p')
    description.textContent = 'Enter an event ID to load schedule sections. The component will fetch data and store it in IndexedDB.'
    description.style.marginBottom = '20px'

    const input = document.createElement('input')
    input.type = 'text'
    input.placeholder = 'Enter event ID'
    input.value = args['data-event-id']
    input.style.marginBottom = '10px'
    input.style.padding = '8px'
    input.style.width = '200px'
    input.style.marginRight = '10px'

    const loadButton = document.createElement('button')
    loadButton.textContent = 'Load Schedule'
    loadButton.style.padding = '8px 16px'
    loadButton.style.backgroundColor = '#007bff'
    loadButton.style.color = 'white'
    loadButton.style.border = 'none'
    loadButton.style.borderRadius = '4px'
    loadButton.style.cursor = 'pointer'
    loadButton.style.marginBottom = '20px'

    const element = document.createElement(CfbScheduleLoader.elementName)
    element.setAttribute('data-event-id', args['data-event-id'])

    const status = document.createElement('div')
    status.id = 'status'
    status.style.padding = '10px'
    status.style.backgroundColor = '#f8f9fa'
    status.style.border = '1px solid #dee2e6'
    status.style.borderRadius = '4px'
    status.style.marginTop = '10px'
    status.textContent = 'Status: Ready to load schedule'

    loadButton.addEventListener('click', () => {
      const eventId = input.value.trim()
      if (eventId) {
        element.setAttribute('data-event-id', eventId)
        status.textContent = `Status: Loading schedule for event ${eventId}...`
        status.style.backgroundColor = '#fff3cd'
        status.style.borderColor = '#ffeaa7'
      } else {
        status.textContent = 'Status: Please enter an event ID'
        status.style.backgroundColor = '#f8d7da'
        status.style.borderColor = '#f5c6cb'
      }
    })

    // Listen for attribute changes to update status
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-event-id') {
          const newEventId = element.getAttribute('data-event-id')
          if (newEventId) {
            setTimeout(() => {
              status.textContent = `Status: Schedule loaded for event ${newEventId} (check IndexedDB)`
              status.style.backgroundColor = '#d4edda'
              status.style.borderColor = '#c3e6cb'
            }, 1000)
          }
        }
      })
    })

    observer.observe(element, { attributes: true })

    const controls = document.createElement('div')
    controls.appendChild(input)
    controls.appendChild(loadButton)

    container.appendChild(title)
    container.appendChild(description)
    container.appendChild(controls)
    container.appendChild(element)
    container.appendChild(status)

    return container
  }
}