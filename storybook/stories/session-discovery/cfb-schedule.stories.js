import {renderSchedule, renderScheduleInteractive} from './cfb-schedule.render.js'

export default {
  title: 'Session Discovery/Components/Schedule',
  parameters: {
    docs: {
      description: {
        component: 'A web component that displays schedule sections from IndexedDB. The component listens for data-updated-at events and renders cfb-section elements for each section.'
      }
    }
  }
}

// Default story - basic component
export const Default = {
  render: renderSchedule,
  args: {
    'data-event-id': 'demo-event-123'
  }
}

// Story with specific event ID
export const WithEventId = {
  render: renderSchedule,
  args: {
    'data-event-id': 'codefreeze-2024'
  }
}

// Interactive story with controls
export const Interactive = {
  render: renderScheduleInteractive,
  args: {
    'data-event-id': 'demo-event-123'
  },
  argTypes: {
    'data-event-id': {
      control: 'text',
      description: 'Event ID to display schedule sections for'
    }
  }
} 