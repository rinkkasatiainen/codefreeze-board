import {renderFlowOfLoadingSchedule, renderScheduleLoaderInteractive} from './cfb-schedule-loader.render.js'
import {
  createSectionHandlers,
  createSessionHandlers
} from '@rinkkasatiainen/cfb-session-discovery/mocks/schedules_mocks.js'
import {buildSessionWith, WellKnown} from '@rinkkasatiainen/cfb-session-discovery-contracts'
import {sectionsForDemo} from '../../session-discovery/mock-data'

export default {
  title: '  Flow/Session Discovery/Loading Schedule',
  parameters: {
    docs: {
      description: {
        component: 'A flow of loadind schedule from backend api'
      }
    },
    msw: {
      handlers: [
        ...createSectionHandlers('demo-event-123', {'/sections': sectionsForDemo}),
        ...createSectionHandlers('codefreeze-2024', {'/sections': []}),
        ...createSectionHandlers('codefreeze-2025', {'/sections': WellKnown.section.codefreeze2025}),
        ...createSessionHandlers('demo-event-123', {'/sessions': [buildSessionWith({sectionId: sectionsForDemo[0].id})]}),
        ...createSessionHandlers('codefreeze-2024', {'/sessions': []}),
        ...createSessionHandlers('codefreeze-2025', {'/sessions': [...WellKnown.sessions.day0Entries, ...WellKnown.sessions.day1Entries]}),
      ],
    },
  },

}

// demo-event-123
export const Default = {
  render: renderFlowOfLoadingSchedule,
  args: {
    'data-event-id': 'demo-event-123'
  },
  argTypes: {
    'data-event-id': { control: {type: 'select'}, options: ['demo-event-123', 'codefreeze-2025']},
  }
}

// codefreeze-2025
export const WithEventId = {
  render: renderFlowOfLoadingSchedule,
  args: {
    'data-event-id': 'codefreeze-2025'
  },
  argTypes: {
    'data-event-id': { control: {type: 'select'}, options: ['demo-event-123', 'codefreeze-2025']},
  }
}

// Interactive story with controls
export const Interactive = {
  render: renderScheduleLoaderInteractive,
  args: {
    'data-event-id': 'demo-event-123'
  },
  argTypes: {
    'data-event-id': { control: {type: 'select'}, options: ['demo-event-123', 'codefreeze-2025']},
  }
} 