import {CfbExampleElement} from '@rinkkasatiainen/cfb-npm-template'

export function render(args) {
  const element = document.createElement(CfbExampleElement.elementName)
  if (args['data-name']) {
    element.setAttribute('data-name', args['data-name'])
  }
  return element
}

export function renderInteractive(args) {
  const container = document.createElement('div')
  container.style.padding = '20px'

  const element = document.createElement(CfbExampleElement.elementName)
  element.setAttribute('data-name', args['data-name'])

  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = 'Enter a name'
  input.value = args['data-name']
  input.style.marginBottom = '10px'
  input.style.padding = '8px'
  input.style.width = '200px'

  input.addEventListener('input', (e) => {
    element.setAttribute('data-name', e.target.value)
  })

  container.appendChild(input)
  container.appendChild(document.createElement('br'))
  container.appendChild(element)

  return container
}
