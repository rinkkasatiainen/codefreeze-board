import {CfbExampleElement} from '@rinkkasatiainen/cfb-npm-template'

// Register the custom element
if (!customElements.get(CfbExampleElement.elementName)) {
  customElements.define(CfbExampleElement.elementName, CfbExampleElement)
}

export default {
  title: 'CFB Components/Example Element',
  component: CfbExampleElement.elementName,
  parameters: {
    docs: {
      description: {
        component: 'A simple example web component that displays a greeting message. It accepts a `data-name` attribute to customize the greeting.'
      }
    }
  },
  argTypes: {
    'data-name': {
      control: 'text',
      description: 'The name to display in the greeting',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'World' }
      }
    }
  }
}

// Default story
export const Default = {
  args: {},
  render: (args) => {
    const element = document.createElement(CfbExampleElement.elementName)
    if (args['data-name']) {
      element.setAttribute('data-name', args['data-name'])
    }
    return element
  }
}

// Story with custom name
export const CustomName = {
  args: {
    'data-name': 'Storybook User'
  },
  render: (args) => {
    const element = document.createElement(CfbExampleElement.elementName)
    element.setAttribute('data-name', args['data-name'])
    return element
  }
}

// Story with empty name
export const EmptyName = {
  args: {
    'data-name': ''
  },
  render: (args) => {
    const element = document.createElement(CfbExampleElement.elementName)
    element.setAttribute('data-name', args['data-name'])
    return element
  }
}

// Interactive story
export const Interactive = {
  args: {
    'data-name': 'Interactive User'
  },
  render: (args) => {
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
} 