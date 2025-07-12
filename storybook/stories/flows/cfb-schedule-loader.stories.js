import {renderFlowOfLoadingSchedule, renderScheduleLoaderInteractive} from './cfb-schedule-loader.render.js'
import {scheduleMocks} from '@rinkkasatiainen/cfb-session-discovery/mocks/schedules.js'

export default {
  title: '  Flow/Loading Schedule',
  parameters: {
    docs: {
      description: {
        component: 'A flow of loadind schedule from backend api'
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
  render: renderFlowOfLoadingSchedule,
  args: {
    'data-event-id': 'demo-event-123'
  }
}

// Story with specific event ID
export const WithEventId = {
  render: renderFlowOfLoadingSchedule,
  args: {
    'data-event-id': 'codefreeze-2025'
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