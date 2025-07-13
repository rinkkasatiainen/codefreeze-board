import {CfbScheduleLoader} from '@rinkkasatiainen/cfb-session-discovery'
import {day0Entries, day1Entries} from '@rinkkasatiainen/cfb-session-discovery/contracts/session-entry.js'
import cfbScheduleStorage
  from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'

export function renderFlowOfLoadingSchedule(args) {
  const eventId = args['data-event-id'] || 'demo-event-123'
  day0Entries.forEach(async (e) => {
    await cfbScheduleStorage.addSession(eventId, e)
  })
  day1Entries.forEach(async (e) => {
    await cfbScheduleStorage.addSession(eventId, e)
  })

  return `
  <div class="cfb-board" role="region" aria-label="Task board">
    <cfb-schedule-loader data-event-id="${eventId}">
      <cfb-session-loader data-event-id="${eventId}" data-section-id="${day0Entries[0].sectionId}" class="listens-schedule-updates">
        <cfb-schedule data-event-id="${eventId}">
        </cfb-schedule>
      </cfb-session-loader>
    </cfb-session-loader>
  </div>`
}

export function renderScheduleLoaderInteractive(args) {
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

