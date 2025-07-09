import {renderStorageDemo} from './storage-demo.render.js'

export default {
  title: 'Template/CFB Components/Storage Demo',
  parameters: {
    docs: {
      description: {
        component: 'A demonstration of the IndexedDB storage functionality. This shows how to add, retrieve, and manage example objects with name, age, and id properties.'
      }
    }
  }
}

// Storage demo story
export const StorageDemo = {
  render: renderStorageDemo
} 