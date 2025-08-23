import {renderSectionStorageDemo} from './section-storage.render'
import {renderSessionStorageDemo} from './session-storage.render'

export default {
  title: 'Data/Cfb Session Discovery/Storage',
  parameters: {
    docs: {
      description: {
        component: 'A demonstration of the IndexedDB storage functionality for schedule sections. This shows how to add, retrieve, and manage schedule sections with event IDs.'
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
