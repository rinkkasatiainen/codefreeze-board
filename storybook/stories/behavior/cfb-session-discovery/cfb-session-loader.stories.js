import {renderSessionLoader, renderSessionLoaderInteractive} from './cfb-session-loader.render.js'
import {createSessionHandlers} from '@rinkkasatiainen/cfb-session-discovery/mocks/schedules_mocks'
import {sectionsForDemo, day1Entries, day0Entries} from '../../session-discovery/mock-data'
import {buildSessionWith} from '@rinkkasatiainen/cfb-session-discovery-contracts'

export default {
  title: 'Session Discovery/Behavior/Session Loader',
  parameters: {
    docs: {
      description: {
        component: 'A session loader component that fetches sessions from the API and stores them in IndexedDB. It updates child components that listen for schedule updates via the data-updated-at attribute.'
      }
    },
    msw: {
      handlers: [
        ...createSessionHandlers('demo-event-123', {'/sessions': [buildSessionWith({sectionId: sectionsForDemo[0].id})]}),
        ...createSessionHandlers('codefreeze-2024', {'/sessions': []}),
        ...createSessionHandlers('codefreeze-2025', {'/sessions': [...day0Entries, ...day1Entries]}),
      ],
    },
  },
  argTypes: {
    'data-event-id': {control: {type: 'select'}, options: ['demo-event-123', 'codefreeze-2025']},
    'data-updated-at': {control: 'text', description: 'Timestamp when sessions were last updated'}
  },
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
}
