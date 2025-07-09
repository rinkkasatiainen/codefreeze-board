import {renderStorageDemo} from './storage.render'

export default {
  title: '  CFB Session Discovery/Storage Demo',
  parameters: {
    docs: {
      description: {
        component: 'A demonstration of the IndexedDB storage functionality for schedule sections. This shows how to add, retrieve, and manage schedule sections with event IDs.'
      }
    }
  }
}

// Storage demo story
export const StorageDemo = {
  render: renderStorageDemo
} 