import {CfbScheduleLoader} from '@rinkkasatiainen/cfb-session-discovery'
import {WellKnown} from '@rinkkasatiainen/cfb-session-discovery-contracts'
import cfbScheduleStorage
  from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'

const {day0Entries, day1Entries} = WellKnown.sessions

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
    <cfb-schedule-orchestrator>
    <cfb-schedule-loader data-event-id="${eventId}" class="listens-event-updates">
    </cfb-schedule-loader>
    <cfb-session-loader data-event-id="${eventId}" class="listens-event-updates">
    </cfb-session-loader>
    <cfb-schedule class="listens-schedule-updates">
    </cfb-schedule>
    </cfb-schedule-orchestrator>
  </div>`
}
export function renderScheduleLoaderInteractive(args) {
  const container = document.createElement('div')

  container.innerHTML = `
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    ${documentation} 
    <div>
    <cfb-schedule-orchestrator>
      <cfb-schedule-loader data-event-id="demo-event-123" data-updated-at="now" class="listens-event-changes">
      </cfb-schedule-loader>
      <cfb-session-loader data-event-id="demo-event-123" data-updated-at="now" class="listens-event-changes">
      </cfb-session-loader>
      <cfb-schedule data-updated-at="now" class="listens-schedule-updates">
      </cfb-schedule>
    </cfb-schedule-orchestrator>
    </div>
    <span id="status" style="padding: 10px; background-color: rgb(248, 249, 250); border: 1px solid rgb(222, 226, 230); border-radius: 4px; margin-top: 10px;">
    </span>
  </div> `

  const select = container.querySelector('select')

  select.addEventListener('change', () => {
    if(!select.value){
      return
    }
    container.querySelectorAll('.listens-event-changes')
      .forEach(it => it.setAttribute('data-event-id', select.value))
  })

  return container
}













export function _renderScheduleLoaderInteractive(args) {
  const eventId = args['data-event-id'] || 'demo-event-123'
  // Note: MSW handlers are configured in the story file, not here

  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'

  const title = document.createElement('h3')
  title.textContent = 'Schedule Loader Demo'
  title.style.marginBottom = '20px'

  const description = document.createElement('p')
  description.textContent = 'Enter an event ID to load schedule sections. The component will fetch data and store it in IndexedDB.'
  description.style.marginBottom = '20px'

  const selectElement = `<select id="select" style="padding: 8px; margin-right: 10px;">
    <option value="demo-event-123">demo-event-123</option>
    <option value="codefreeze-2024">codefreeze-2024</option>
    <option value="codefreeze-2025">codefreeze-2025</option>
  </select>`


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

  const htmlElement = `<cfb-schedule-orchestrator>
            <cfb-schedule-loader data-event-id="${eventId}" data-updated-at="now">
            </cfb-schedule-loader>
            <cfb-session-loader data-event-id="${eventId}" data-updated-at="now">
            </cfb-session-loader>
            <cfb-schedule data-event-id="${eventId}" data-updated-at="now" class="listens-schedule-updates">
            </cfb-schedule>
        </cfb-schedule-orchestrator>`
  const element = document.createElement('div')
  element.innerHTML = htmlElement

  const status = document.createElement('div')
  status.id = 'status'
  status.style.padding = '10px'
  status.style.backgroundColor = '#f8f9fa'
  status.style.border = '1px solid #dee2e6'
  status.style.borderRadius = '4px'
  status.style.marginTop = '10px'
  status.textContent = 'Status: Ready to load schedule'

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
  controls.innerHTML = selectElement
  controls.appendChild(loadButton)
  
  container.appendChild(title)
  container.appendChild(description)
  container.appendChild(controls)
  container.appendChild(element)
  container.appendChild(status)
  
  return container
}

const documentation = `
    <h3 style="margin-bottom: 20px;">Schedule Loader Demo</h3>
    <p style="margin-bottom: 20px;">Enter an event ID to load schedule sections. The component will fetch data and store it in IndexedDB.</p>
    <div>
    <select id="select" style="padding: 8px; margin-right: 10px;">
      <option value="">Select</option>
      <option value="demo-event-123">demo-event-123</option>
      <option value="codefreeze-2024">codefreeze-2024</option>
      <option value="codefreeze-2025">codefreeze-2025</option>
    </select>
    </div>
`
