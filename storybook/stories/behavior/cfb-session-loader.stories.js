import {renderSessionLoader, renderSessionLoaderInteractive} from './cfb-session-loader.render.js'

export default {
  title: '  Behavior/Cfb Session Discovery/Session Loader',
  parameters: {
    docs: {
      description: {
        component: 'A session loader component that fetches sessions from the API and stores them in IndexedDB. It updates child components that listen for schedule updates via the data-updated-at attribute.'
      }
    }
  }
}

// Default story - basic component
export const Default = {
  render: renderSessionLoader,
  args: {
    'data-event-id': 'demo-event-123',
    'data-updated-at': new Date().toISOString()
  }
}

// Story with specific event ID
export const WithEventId = {
  render: renderSessionLoader,
  args: {
    'data-event-id': 'codefreeze-2024',
    'data-updated-at': new Date().toISOString()
  }
}

// Interactive story with controls
export const Interactive = {
  render: renderSessionLoaderInteractive,
  args: {
    'data-event-id': 'demo-event-123'
  },
  argTypes: {
    'data-event-id': {
      control: 'text',
      description: 'Event ID to load sessions for'
    },
    'data-updated-at': {
      control: 'text',
      description: 'Timestamp when sessions were last updated'
    }
  }
}
