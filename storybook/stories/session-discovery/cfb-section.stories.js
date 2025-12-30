import {renderSection, renderSectionWithContent} from './cfb-section.render.js'

export default {
  title: 'Session Discovery/Components/Section',
  parameters: {
    docs: {
      description: {
        component: 'A section component that displays a column with title and content area. The component can contain session cards and supports drag-and-drop functionality for session management.'
      }
    }
  }
}

// Default story - basic component
export const Default = {
  render: renderSection,
  args: {
    'data-name': 'Sample Section',
    'data-section-id': 'section-1',
    'data-event-id': 'demo-event-123'
  }
}

// Story with specific section name
export const WithCustomName = {
  render: renderSection,
  args: {
    'data-name': 'Workshop Day',
    'data-section-id': 'workshop-day',
    'data-event-id': 'codefreeze-2024'
  }
}

// Story with sample content
export const WithContent = {
  render: renderSectionWithContent,
  args: {
    'data-name': 'Conference Sessions',
    'data-section-id': 'conference-sessions',
    'data-event-id': 'demo-event-123'
  }
}
