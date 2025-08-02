import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

// Create the MSW worker
export const worker = setupWorker(...handlers)

// Start the worker
export async function startMSW() {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    })
    console.log('MSW started successfully')
  } catch (error) {
    console.error('Failed to start MSW:', error)
  }
} 