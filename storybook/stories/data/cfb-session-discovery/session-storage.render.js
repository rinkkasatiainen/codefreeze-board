import {WellKnown} from '@rinkkasatiainen/cfb-session-discovery-contracts'
import cfbScheduleStorage
  from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'


const {day0Entries, day1Entries} = WellKnown.sessions

function getAllSectionsByEventId(storage) {
  storage.getAllSectionsByEvents = function () {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const indexName = 'eventId'
      const index = objectStore.index(indexName)

      index.getAllKeys().onsuccess = (event) => {
        const sectionsByEventId = event.target.result
        console.log('getAllKeys success', sectionsByEventId)
        resolve(sectionsByEventId)
      }
    })
  }
  return storage.getAllSectionsByEvents()
}

export function renderSessionStorageDemo() {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'

  const title = document.createElement('h3')
  title.textContent = 'Schedule Storage Demo'
  title.style.marginBottom = '20px'

  const description = document.createElement('p')
  description.textContent = 'This demo shows the schedule storage functionality. Add sections, view them by event ID, and clear the storage.'
  description.style.marginBottom = '20px'

  // Controls
  const controls = document.createElement('div')
  controls.style.marginBottom = '20px'


  const eventIdInput = document.createElement('select')
  eventIdInput.id = 'event-id-select'
  eventIdInput.style.marginRight = '10px'
  eventIdInput.style.padding = '8px'
  eventIdInput.style.width = '150px'
  const defaultOption = document.createElement('option')
  defaultOption.value = ''
  defaultOption.textContent = 'Select event from storage'
  defaultOption.disabled = true
  eventIdInput.appendChild(defaultOption)

  const sectionIdInput = document.createElement('select')
  sectionIdInput.id = 'section-id-select'
  sectionIdInput.style.marginRight = '10px'
  sectionIdInput.style.padding = '8px'
  sectionIdInput.style.width = '150px'
  const defaultEntry = document.createElement('option')
  defaultEntry.value = ''
  defaultEntry.textContent = 'Select event from storage'
  defaultEntry.disabled = true
  sectionIdInput.appendChild(defaultEntry)

  const addButton = document.createElement('button')
  addButton.textContent = 'Add Sample Sections'
  addButton.style.marginRight = '10px'
  addButton.style.padding = '8px 16px'
  addButton.style.backgroundColor = '#007bff'
  addButton.style.color = 'white'
  addButton.style.border = 'none'
  addButton.style.borderRadius = '4px'
  addButton.style.cursor = 'pointer'

  const getButton = document.createElement('button')
  getButton.textContent = 'Get Sections'
  getButton.style.marginRight = '10px'
  getButton.style.padding = '8px 16px'
  getButton.style.backgroundColor = '#28a745'
  getButton.style.color = 'white'
  getButton.style.border = 'none'
  getButton.style.borderRadius = '4px'
  getButton.style.cursor = 'pointer'

  const clearButton = document.createElement('button')
  clearButton.textContent = 'Clear Storage'
  clearButton.style.padding = '8px 16px'
  clearButton.style.backgroundColor = '#dc3545'
  clearButton.style.color = 'white'
  clearButton.style.border = 'none'
  clearButton.style.borderRadius = '4px'
  clearButton.style.cursor = 'pointer'

  // Output area
  const output = document.createElement('div')
  output.id = 'storage-output'
  output.style.padding = '15px'
  output.style.backgroundColor = '#f8f9fa'
  output.style.border = '1px solid #dee2e6'
  output.style.borderRadius = '4px'
  output.style.fontFamily = 'monospace'
  output.style.whiteSpace = 'pre-wrap'
  output.style.minHeight = '100px'
  output.textContent = 'Storage output will appear here...'


  var grouped = {}
  // Initialize storage
  cfbScheduleStorage.init()
    .then(() => {
      console.log('Storage initialized successfully')
      getAllSectionsByEventId(cfbScheduleStorage).then(eventIds => {
        console.log('eventIds', eventIds)
        grouped = eventIds.reduce((acc, [eventId, sectionId]) => {
          const events = acc[eventId] || []
          events.push(sectionId)
          acc[eventId] = events
          return acc
        }, {})
        console.log('grouped', grouped)
        Object.keys(grouped).forEach(eventId => {
          const option = document.createElement('option');
          option.value = eventId;
          option.textContent = eventId;
          eventIdInput.appendChild(option);
        })
      })
    }).then(() => {
  })
    .catch(error => {
      console.error('Storage initialization failed:', error)
    })

  // Sample sections data
  // TODO: take this from somewhere in domain! Even a pact test?
  const sampleSessions = sectionId =>  [
    ...day0Entries.map(it => ({...it, sectionId})), ...day1Entries.map(it => ({...it, sectionId}))
  ]

  // Event handlers
  addButton.addEventListener('click', async () => {
    try {
      const eventId = eventIdInput.value.trim() || 'demo-event-123'
      const sectionId = sectionIdInput.value.trim() || 'demo-section-123'

      // Add sample sections
      let createdSessions = sampleSessions(sectionId)
      const addPromises = createdSessions.map(section =>
        cfbScheduleStorage.addSession(eventId, section)
      )
      await Promise.all(addPromises)

      output.textContent = `✅ Added ${createdSessions.length} sections for event: ${eventId}\n\nSections:\n${JSON.stringify(createdSessions, null, 2)}`
    } catch (error) {
      output.textContent = `❌ Error adding sessions: ${error.message}`
    }
  })

  getButton.addEventListener('click', async () => {
    try {
      const eventId = eventIdInput.value.trim() || 'demo-event-123'
      const sectionId = sectionIdInput.value.trim() || 'demo-section-123'
      const sessions = await cfbScheduleStorage.getAllSessionsForSection(eventId, sectionId)

      if (sessions.length === 0) {
        output.textContent = `📭 No sessions found for event: ${eventId} - section: ${sectionId}`
      } else {
        output.textContent = `📋 Found ${sessions.length} session(s) for event: ${eventId}\n\nSections:\n${JSON.stringify(sessions, null, 2)}`
      }
    } catch (error) {
      output.textContent = `❌ Error getting sections: ${error.message}`
    }
  })

  clearButton.addEventListener('click', async () => {
    try {
      const eventId = eventIdInput.value.trim() || 'demo-event-123'
      const sectionId = sectionIdInput.value.trim() || 'demo-section-123'
      const sessions = await cfbScheduleStorage.getAllSessionsForSection(eventId, sectionId)
      const deletePromises = sessions.map(session =>
        cfbScheduleStorage.deleteSession(eventId, session.id)
      )
      await Promise.all(deletePromises)
      output.textContent = `🗑️ Cleared ${sessions.length} sessions(s) for event: ${eventId}`
    } catch (error) {
      output.textContent = `❌ Error clearing storage: ${error.message}`
    }
  })

  eventIdInput.addEventListener('change', () => {
    const eventId = eventIdInput.value.trim()
    const sections = grouped[eventId]
    sectionIdInput.innerHTML = ''
    sections.forEach(section => {
      const option = document.createElement('option');
      option.value = section;
      option.textContent = section;
      sectionIdInput.appendChild(option);
    })
  })

  // Assemble the UI
  const inputGroup = document.createElement('div')
  inputGroup.style.marginBottom = '10px'
  inputGroup.appendChild(eventIdInput)
  inputGroup.appendChild(sectionIdInput)

  const buttonGroup = document.createElement('div')
  buttonGroup.appendChild(addButton)
  buttonGroup.appendChild(getButton)
  buttonGroup.appendChild(clearButton)

  controls.appendChild(inputGroup)
  controls.appendChild(buttonGroup)

  container.appendChild(title)
  container.appendChild(description)
  container.appendChild(controls)
  container.appendChild(output)

  return container
}