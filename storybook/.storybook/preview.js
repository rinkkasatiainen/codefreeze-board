import { initialize, mswLoader } from 'msw-storybook-addon'

// Initialize MSW
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
    msw: {
      handlers: [], // Will be set per story
    },
  },
  loaders: [mswLoader],
};

export default preview;