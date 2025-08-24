import {renderSessionScheduler, renderSessionSchedulerWithSection} from './cfb-session-scheduler.render.js'

export default {
  title: '  Behavior/Cfb Session Discovery/Session Scheduler',
  parameters: {
    docs: {
      description: {
        component: 'A session scheduler component that fetches and displays sessions for a specific section. It groups sessions by section ID, sorts them by order, and renders them as session cards within the section.'
      }
    }
  }
}

// Default story - basic component
export const Default = {
  render: renderSessionScheduler,
  args: {
    'data-event-id': 'demo-event-123',
    'data-section-id': 'section-1',
    'data-updated-at': new Date().toISOString()
  }
}

// Story with specific event and section
export const WithEventAndSection = {
  render: renderSessionScheduler,
  args: {
    'data-event-id': 'codefreeze-2024',
    'data-section-id': 'workshop-day',
    'data-updated-at': new Date().toISOString()
  }
}

// Story with section container
export const WithSection = {
  render: renderSessionSchedulerWithSection,
  args: {
    'data-event-id': 'demo-event-123',
    'data-section-id': 'section-1',
    'data-section-name': 'Conference Sessions',
    'data-updated-at': new Date().toISOString()
  }
}
