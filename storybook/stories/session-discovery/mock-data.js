import { exampleSessionEntry, day0Entries, day1Entries } from '@rinkkasatiainen/cfb-session-discovery/contracts/session-entry.js'

// Export the mock data for use in handlers
export { exampleSessionEntry, day0Entries, day1Entries }

// Additional mock data for Storybook
export const mockEventId = 'codefreeze-2024'
export const mockSectionId = 'day-1'

// Mock storage data for IndexDB simulation
export const mockStorageData = {
  sections: [
    {
      id: 'day-0',
      name: 'Day 0 - Travel',
      order: 0,
      eventId: mockEventId
    },
    {
      id: 'day-1',
      name: 'Day 1 - Activities', 
      order: 1,
      eventId: mockEventId
    }
  ],
  sessions: {
    'day-0': day0Entries,
    'day-1': day1Entries
  }
} 