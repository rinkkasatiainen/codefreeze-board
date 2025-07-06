import {NpmTemplateModule} from './src/npm-template-module.js'
import  exampleStorage from './src/storage/example-storage.js'

// Initialize the module
const module = new NpmTemplateModule()

// Configure and run the module
async function initializeModule() {
  try {
    await module.configure()
    await module.run()
    console.log('CFB NPM Template module initialized successfully!')
  } catch (error) {
    console.error('Error initializing module:', error)
  }
}

// Storage demo functions
window.addExample = async function() {
  try {
    const example = {
      id: `example-${Date.now()}`,
      name: `Example ${Math.floor(Math.random() * 1000)}`,
      age: Math.floor(Math.random() * 50) + 18,
    }

    await exampleStorage.addExample(example)
    document.getElementById('storage-output').textContent = `Added example: ${JSON.stringify(example, null, 2)}`
    document.querySelector('.changes')?.setAttribute('data-name', example.name)
  } catch (error) {
    document.getElementById('storage-output').textContent = `Error adding example: ${error.message}`
  }
}

window.getAllExamples = async function() {
  try {
    const examples = await exampleStorage.getAllExamples()
    document.getElementById('storage-output').textContent = `All examples: ${JSON.stringify(examples, null, 2)}`
  } catch (error) {
    document.getElementById('storage-output').textContent = `Error getting examples: ${error.message}`
  }
}

window.clearStorage = async function() {
  try {
    const examples = await exampleStorage.getAllExamples()
    const deletePromises = examples.map(example => exampleStorage.deleteExample(example.id))
    await Promise.all(deletePromises)
    document.getElementById('storage-output').textContent = `Cleared ${examples.length} examples from storage`
  } catch (error) {
    document.getElementById('storage-output').textContent = `Error clearing storage: ${error.message}`
  }
}

initializeModule()
// Initialize when the page loads
// document.addEventListener('DOMContentLoaded', initializeModule)
