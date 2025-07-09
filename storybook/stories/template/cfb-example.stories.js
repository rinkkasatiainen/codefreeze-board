import {CfbExampleElement} from '@rinkkasatiainen/cfb-npm-template'
import {render, renderInteractive} from './cfb-example.render'

// Register the custom element
if (!customElements.get(CfbExampleElement.elementName)) {
  customElements.define(CfbExampleElement.elementName, CfbExampleElement)
}

export default {
  title: 'Template/CFB Components/Example Element',
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
  render
}

// Story with custom name
export const CustomName = {
  args: {
    'data-name': 'Storybook User'
  },
  render
}

// Story with empty name
export const EmptyName = {
  args: {
    'data-name': ''
  },
  render
}

// Interactive story
export const Interactive = {
  args: {
    'data-name': 'Interactive User'
  },
  render: renderInteractive
}