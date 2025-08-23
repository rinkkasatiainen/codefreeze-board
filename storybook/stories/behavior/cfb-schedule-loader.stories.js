import {renderScheduleLoader, renderScheduleLoaderInteractive} from './cfb-schedule-loader.render.js'
import {scheduleMocks} from '@rinkkasatiainen/cfb-session-discovery/mocks/schedules.js'

export default {
  title: 'Behavior/Cfb Session Discovery/Schedule Loader',
  parameters: {
    docs: {
      description: {
        component: 'A web component that loads schedule sections from an API and stores them in IndexedDB. The component listens for data-updated-at events and manages schedule data persistence.'
      }
    },
    msw: {
      handlers: [
        scheduleMocks()
      ],
    },
  },

}

// Default story - basic component
export const Default = {
  render: renderScheduleLoader,
  args: {
    'data-event-id': 'demo-event-123'
  }
}

// Story with specific event ID
export const WithEventId = {
  render: renderScheduleLoader,
  args: {
    'data-event-id': 'codefreeze-2024'
  }
}

// Interactive story with controls
export const Interactive = {
  render: renderScheduleLoaderInteractive,
  args: {
    'data-event-id': 'demo-event-123'
  },
  argTypes: {
    'data-event-id': {
      control: 'text',
      description: 'Event ID to load schedule sections for'
    }
  }
} 