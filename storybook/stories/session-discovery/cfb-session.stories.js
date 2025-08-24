import {render} from './cfb-session.render'
import {day0Entries, day1Entries} from './mock-data.js'

// Register the custom element
export default {
  title: '  CFB Session Discovery/Session',
  parameters: {
    docs: {
      description: {
        component: 'A session component that displays individual session data with title, description, tags, and speakers. It accepts various data attributes to customize the session display.'
      }
    }
  },
  argTypes: {
    'data-session-id': {
      control: 'text',
      description: 'Unique identifier for the session',
      table: {
        type: {summary: 'string'}
      }
    },
    'data-name': {
      control: 'text',
      description: 'The name/title of the session',
      table: {
        type: {summary: 'string'}
      }
    },
    'data-description': {
      control: 'text',
      description: 'Description of the session',
      table: {
        type: {summary: 'string'}
      }
    },
    'data-tags': {
      control: 'object',
      description: 'Array of tags with name and type properties',
      table: {
        type: {summary: 'array'}
      }
    },
    'data-speakers': {
      control: 'object',
      description: 'Array of speakers with name and initial/initials properties',
      table: {
        type: {summary: 'array'}
      }
    },
    'data-order': {
      control: 'number',
      description: 'Order/position of the session',
      table: {
        type: {summary: 'number'}
      }
    }
  }
}

// Default story
export const Default = {
  args: {
    'data-session-id': 'session-1',
    'data-name': 'Example Session',
    'data-description': 'This is an example session description.',
    'data-tags': [
      {name: 'Workshop', type: 'blue'},
      {name: 'Beginner', type: 'green'}
    ],
    'data-speakers': [
      {name: 'John Doe', initials: 'JD'},
      {name: 'Jane Smith', initials: 'JS'}
    ],
    'data-order': 0
  },
  render
}

// Story with travel session data
export const TravelSession = {
  args: {
    'data-session-id': day0Entries[0].id,
    'data-name': day0Entries[0].name,
    'data-description': day0Entries[0].description,
    'data-tags': day0Entries[0].tags,
    'data-speakers': day0Entries[0].speakers,
    'data-order': day0Entries[0].order
  },
  render
}

// Story with activity session data
export const ActivitySession = {
  args: {
    'data-session-id': day1Entries[0].id,
    'data-name': day1Entries[0].name,
    'data-description': day1Entries[0].description,
    'data-tags': day1Entries[0].tags,
    'data-speakers': day1Entries[0].speakers,
    'data-order': day1Entries[0].order
  },
  render
}

// Story with minimal data
export const MinimalSession = {
  args: {
    'data-session-id': 'minimal-session',
    'data-name': 'Minimal Session',
    'data-description': '',
    'data-tags': [],
    'data-speakers': [],
    'data-order': 0
  },
  render
}

// Story with long description
export const LongDescription = {
  args: {
    'data-session-id': 'long-desc-session',
    'data-name': 'Session with Long Description',
    'data-description': 'This is a very long description that demonstrates how the session component handles longer text content. It should wrap properly and maintain good readability.',
    'data-tags': [
      {name: 'Long Content', type: 'purple'},
      {name: 'Demo', type: 'yellow'}
    ],
    'data-speakers': [
      {name: 'Alice Johnson', initials: 'AJ'},
      {name: 'Bob Wilson', initials: 'BW'},
      {name: 'Carol Davis', initials: 'CD'}
    ],
    'data-order': 1
  },
  render
}