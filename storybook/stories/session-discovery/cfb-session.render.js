import {CfbSession} from '@rinkkasatiainen/cfb-session-discovery'

export function render(args) {
  const element = document.createElement(CfbSession.elementName)
  
  if (args['data-session-id']) {
    element.setAttribute('data-session-id', args['data-session-id'])
  }
  if (args['data-name']) {
    element.setAttribute('data-name', args['data-name'])
  }
  if (args['data-description']) {
    element.setAttribute('data-description', args['data-description'])
  }
  if (args['data-tags']) {
    element.setAttribute('data-tags', JSON.stringify(args['data-tags']))
  }
  if (args['data-speakers']) {
    element.setAttribute('data-speakers', JSON.stringify(args['data-speakers']))
  }
  if (args['data-order']) {
    element.setAttribute('data-order', args['data-order'])
  }
  
  return element
}

export function renderInteractive(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.maxWidth = '400px'

  const element = document.createElement(CfbSession.elementName)
  element.setAttribute('data-session-id', args['data-session-id'] || 'session-1')
  element.setAttribute('data-name', args['data-name'] || 'Interactive Session')
  element.setAttribute('data-description', args['data-description'] || '')
  element.setAttribute('data-tags', JSON.stringify(args['data-tags'] || []))
  element.setAttribute('data-speakers', JSON.stringify(args['data-speakers'] || []))
  element.setAttribute('data-order', args['data-order'] || '0')

  // Create controls
  const controls = document.createElement('div')
  controls.style.marginBottom = '20px'
  controls.style.display = 'flex'
  controls.style.flexDirection = 'column'
  controls.style.gap = '10px'

  // Name input
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.placeholder = 'Session name'
  nameInput.value = args['data-name'] || ''
  nameInput.style.padding = '8px'
  nameInput.addEventListener('input', (e) => {
    element.setAttribute('data-name', e.target.value)
  })

  // Description textarea
  const descTextarea = document.createElement('textarea')
  descTextarea.placeholder = 'Session description'
  descTextarea.value = args['data-description'] || ''
  descTextarea.style.padding = '8px'
  descTextarea.style.height = '60px'
  descTextarea.addEventListener('input', (e) => {
    element.setAttribute('data-description', e.target.value)
  })

  // Tags input
  const tagsInput = document.createElement('input')
  tagsInput.type = 'text'
  tagsInput.placeholder = 'Tags (JSON format: [{"name":"tag","type":"blue"}])'
  tagsInput.value = JSON.stringify(args['data-tags'] || [])
  tagsInput.style.padding = '8px'
  tagsInput.addEventListener('input', (e) => {
    try {
      const tags = JSON.parse(e.target.value)
      element.setAttribute('data-tags', JSON.stringify(tags))
    } catch (error) {
      // Invalid JSON, ignore
    }
  })

  // Speakers input
  const speakersInput = document.createElement('input')
  speakersInput.type = 'text'
  speakersInput.placeholder = 'Speakers (JSON format: [{"name":"John","initial":"JD"}])'
  speakersInput.value = JSON.stringify(args['data-speakers'] || [])
  speakersInput.style.padding = '8px'
  speakersInput.addEventListener('input', (e) => {
    try {
      const speakers = JSON.parse(e.target.value)
      element.setAttribute('data-speakers', JSON.stringify(speakers))
    } catch (error) {
      // Invalid JSON, ignore
    }
  })

  // Add controls to container
  controls.appendChild(nameInput)
  controls.appendChild(descTextarea)
  controls.appendChild(tagsInput)
  controls.appendChild(speakersInput)

  container.appendChild(controls)
  container.appendChild(element)

  return container
} 