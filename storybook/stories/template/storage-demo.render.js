import exampleStorage from '@rinkkasatiainen/cfb-npm-template/src/storage/example-storage.js'

export function renderStorageDemo() {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'
  
  // Initialize storage
  exampleStorage.init()
  
  const title = document.createElement('h3')
  title.textContent = 'IndexedDB Storage Demo'
  title.style.marginBottom = '20px'
  
  const description = document.createElement('p')
  description.textContent = 'This demo shows the storage functionality. Add examples, view them, and clear the storage.'
  description.style.marginBottom = '20px'
  
  // Controls
  const controls = document.createElement('div')
  controls.style.marginBottom = '20px'
  
  const addButton = document.createElement('button')
  addButton.textContent = 'Add Random Example'
  addButton.style.marginRight = '10px'
  addButton.style.padding = '8px 16px'
  addButton.style.backgroundColor = '#007bff'
  addButton.style.color = 'white'
  addButton.style.border = 'none'
  addButton.style.borderRadius = '4px'
  addButton.style.cursor = 'pointer'
  
  const getButton = document.createElement('button')
  getButton.textContent = 'Get All Examples'
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
  
  // Event handlers
  addButton.addEventListener('click', async () => {
    try {
      const example = {
        id: `example-${Date.now()}`,
        name: `Example ${Math.floor(Math.random() * 1000)}`,
        age: Math.floor(Math.random() * 50) + 18
      }
      
      await exampleStorage.addExample(example)
      output.textContent = `✅ Added example: ${JSON.stringify(example, null, 2)}`
    } catch (error) {
      output.textContent = `❌ Error adding example: ${error.message}`
    }
  })
  
  getButton.addEventListener('click', async () => {
    try {
      const examples = await exampleStorage.getAllExamples()
      if (examples.length === 0) {
        output.textContent = '📭 No examples found in storage'
      } else {
        output.textContent = `📋 Found ${examples.length} example(s):\n${JSON.stringify(examples, null, 2)}`
      }
    } catch (error) {
      output.textContent = `❌ Error getting examples: ${error.message}`
    }
  })
  
  clearButton.addEventListener('click', async () => {
    try {
      const examples = await exampleStorage.getAllExamples()
      const deletePromises = examples.map(example => exampleStorage.deleteExample(example.id))
      await Promise.all(deletePromises)
      output.textContent = `🗑️ Cleared ${examples.length} example(s) from storage`
    } catch (error) {
      output.textContent = `❌ Error clearing storage: ${error.message}`
    }
  })
  
  // Assemble the UI
  controls.appendChild(addButton)
  controls.appendChild(getButton)
  controls.appendChild(clearButton)
  
  container.appendChild(title)
  container.appendChild(description)
  container.appendChild(controls)
  container.appendChild(output)
  
  return container
} 