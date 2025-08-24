import {CfbColumnTitleElement} from '@rinkkasatiainen/cfb-session-discovery/dist/src/loads-sections/components/cfb-column-title'
import {render, renderInteractive, renderWithDragAndDrop} from './cfb-column-title.render.js'

// Register the custom element
if (!customElements.get(CfbColumnTitleElement.elementName)) {
  customElements.define(CfbColumnTitleElement.elementName, CfbColumnTitleElement)
}

export default {
  title: 'Session Discovery/CFB Components/Column Title',
  component: CfbColumnTitleElement.elementName,
  parameters: {
    docs: {
      description: {
        component: 'A column title component that displays a title and supports drag and drop functionality for CfbSession elements. It accepts a `name` attribute to customize the title text.'
      }
    }
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'The title text to display',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Column Title' }
      }
    }
  }
}

// Default story
export const Default = {
  args: {},
  render
}

// Story with custom title
export const CustomTitle = {
  args: {
    name: 'My Custom Column'
  },
  render
}

// Story with long title
export const LongTitle = {
  args: {
    name: 'This is a very long column title that might wrap to multiple lines'
  },
  render
}

// Story with empty title
export const EmptyTitle = {
  args: {
    name: ''
  },
  render
}

// Interactive story
export const Interactive = {
  args: {
    name: 'Interactive Column'
  },
  render: renderInteractive
}

// Drag and drop story
export const WithDragAndDrop = {
  args: {
    name: 'Drag Over Me'
  },
  render: renderWithDragAndDrop
}
