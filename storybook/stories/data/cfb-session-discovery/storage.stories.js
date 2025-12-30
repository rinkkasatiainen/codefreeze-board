import {renderSectionStorageDemo} from './section-storage.render'
import {renderSessionStorageDemo} from './session-storage.render'

export default {
  title: 'Session Discovery/Data/Storage',
  parameters: {
    docs: {
      description: {
        component: 'A demonstration of the IndexedDB storage functionality for schedule sections. ' +
          'This shows how to add, retrieve, and manage schedule sections with event IDs.' +
          'To remove a section, click "clear storage". ' +
          'To add a new section, use \'Schedule loader\' to use mock data to add sections to db.'
      }
    }
  }
}

// Storage demo story
export const SectionStorage = {
  render: renderSectionStorageDemo
}

export const SessionStorageDemo = {
  render: renderSessionStorageDemo
}
