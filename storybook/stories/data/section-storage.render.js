import cfbScheduleStorage
  from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/ports/cfb-schedule-storage'



function getEventIds(storage) {
  storage.getAllEventIds = function(){
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const objectStore = transaction.objectStore(this.storeName)
      const indexName = 'eventId'
      const index = objectStore.index(indexName);

      index.getAllKeys().onsuccess = (event) => {
        const keys = event.target.result.map(key => key[0])
        resolve([...new Set(keys)])
      }
    })
  }
  return storage.getAllEventIds();
}

export function renderSectionStorageDemo() {
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
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select event from storage';
  defaultOption.disabled = true;
  eventIdInput.appendChild(defaultOption);


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



  // Initialize storage
  cfbScheduleStorage.init()
    .then(() => {
      console.log('Storage initialized successfully')
      getEventIds(cfbScheduleStorage).then(eventIds => {
        eventIds.forEach(id => {
          const option = document.createElement('option');
          option.value = id;
          option.textContent = id;
          eventIdInput.appendChild(option);
        })
      })
    })
    .catch(error => {
      console.error('Storage initialization failed:', error)
    })

  // Sample sections data
  // TODO: take this from somewhere in domain! Even a pact test?
  const sampleSections = [
    {id: 'section-1', name: 'Monday', order: 0},
    {id: 'section-2', name: 'Tuesday', order: 1},
    {id: 'section-3', name: 'Wednesday', order: 2},
    {id: 'section-4', name: 'Thursday', order: 3},
    {id: 'section-5', name: 'Friday', order: 4}
  ]

  // Event handlers
  addButton.addEventListener('click', async () => {
    try {
      const eventId = eventIdInput.value.trim() || 'demo-event-123'

      // Add sample sections
      const addPromises = sampleSections.map(section =>
        cfbScheduleStorage.addSection(eventId, section)
      )
      await Promise.all(addPromises)

      output.textContent = `✅ Added ${sampleSections.length} sections for event: ${eventId}\n\nSections:\n${JSON.stringify(sampleSections, null, 2)}`
    } catch (error) {
      output.textContent = `❌ Error adding sections: ${error.message}`
    }
  })

  getButton.addEventListener('click', async () => {
    try {
      const eventId = eventIdInput.value.trim() || 'demo-event-123'
      const sections = await cfbScheduleStorage.getAllSections(eventId)

      if (sections.length === 0) {
        output.textContent = `📭 No sections found for event: ${eventId}`
      } else {
        output.textContent = `📋 Found ${sections.length} section(s) for event: ${eventId}\n\nSections:\n${JSON.stringify(sections, null, 2)}`
      }
    } catch (error) {
      output.textContent = `❌ Error getting sections: ${error.message}`
    }
  })

  clearButton.addEventListener('click', async () => {
    try {
      const eventId = eventIdInput.value.trim() || 'demo-event-123'
      const sections = await cfbScheduleStorage.getAllSections(eventId)
      const deletePromises = sections.map(section =>
        cfbScheduleStorage.deleteSection(eventId, section.id)
      )
      await Promise.all(deletePromises)
      output.textContent = `🗑️ Cleared ${sections.length} section(s) for event: ${eventId}`
    } catch (error) {
      output.textContent = `❌ Error clearing storage: ${error.message}`
    }
  })

  // Assemble the UI
  const inputGroup = document.createElement('div')
  inputGroup.style.marginBottom = '10px'
  inputGroup.appendChild(eventIdInput)

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