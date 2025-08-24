import {CfbColumnTitleElement} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-column-title'

export function render(args) {
  const element = document.createElement(CfbColumnTitleElement.elementName)
  if (args.name) {
    element.setAttribute('name', args.name)
  }
  return element
}

export function renderInteractive(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'

  const element = document.createElement(CfbColumnTitleElement.elementName)
  element.setAttribute('name', args.name)

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Enter column title'
  input.value = args.name
  input.style.marginBottom = '10px'
  input.style.padding = '8px'
  input.style.width = '200px'

  input.addEventListener('input', (e) => {
    element.setAttribute('name', e.target.value)
  })

  container.appendChild(input)
  container.appendChild(document.createElement('br'))
  container.appendChild(element)

  return container
}

export function renderWithDragAndDrop(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'

  const element = document.createElement(CfbColumnTitleElement.elementName)
  element.setAttribute('name', args.name)

  // Add event listener to demonstrate drag and drop functionality
  element.addEventListener('cfb-column-title-dragover', (event) => {
    console.log('CfbColumnTitle dragover event dispatched:', event)
  })

  const info = document.createElement('div')
  info.style.marginTop = '10px'
  info.style.fontSize = '12px'
  info.style.color = '#666'
  info.textContent = 'Drag a CfbSession over this title to test drag and drop functionality'

  container.appendChild(element)
  container.appendChild(info)

  return container
}
