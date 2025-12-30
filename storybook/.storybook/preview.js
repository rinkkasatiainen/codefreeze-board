import { initialize, mswLoader } from 'msw-storybook-addon'

// Initialize MSW for Storybook
// The service worker is automatically loaded from public/mockServiceWorker.js
// (configured in package.json under "msw.workerDirectory")
initialize()

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    // MSW handlers are configured per story via the msw.handlers parameter
    // Each story should provide its handlers using createSessionHandlers/createSectionHandlers
    // from '@rinkkasatiainen/cfb-session-discovery/mocks/schedules_mocks'
    msw: {
      handlers: [], // Handlers are set per story, not globally
    },
  },
  loaders: [mswLoader],
};

export default preview;