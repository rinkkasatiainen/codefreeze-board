import {renderScheduleLoader, renderScheduleLoaderInteractive} from './cfb-schedule-loader.render.js'
import {createSectionHandlers} from '@rinkkasatiainen/cfb-session-discovery/mocks/schedules_mocks'
import {WellKnown} from '@rinkkasatiainen/cfb-session-discovery-contracts'
import {sectionsForDemo} from '../../session-discovery/mock-data'

export default {
  title: 'Session Discovery/Behavior/Schedule Loader',
  parameters: {
    docs: {
      description: {
        component: 'A web component that loads schedule sections from an API and stores them in IndexedDB. The component listens for data-updated-at events and manages schedule data persistence.'
      }
    },
    msw: {
      handlers: [
        ...createSectionHandlers('demo-event-123', {'/sections': sectionsForDemo}),
        ...createSectionHandlers('codefreeze-2024', {'/sections': []}),
        ...createSectionHandlers('codefreeze-2025', {'/sections': WellKnown.section.codefreeze2025}),
      ],
    },
  },
  argTypes: {
    'data-event-id': { control: {type: 'select'}, options: ['demo-event-123', 'codefreeze-2025']},
  },
}

// Load for event:
export const Default = {
  render: renderScheduleLoader,
  args: {
    'data-event-id': 'demo-event-123'
  }
}

// Interactive story with controls
export const Interactive = {
  render: renderScheduleLoaderInteractive,
  args: {
    'data-event-id': 'demo-event-123'
  }
}