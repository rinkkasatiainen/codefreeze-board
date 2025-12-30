import {importMapsPlugin} from '@web/dev-server-import-maps'

// Define test-specific module mappings
const testImportMappings = {
}

// Web server plugins configuration
const plugins = [
  importMapsPlugin({
    inject: {
      importMap: {
        imports: testImportMappings,
      },
    },
  }),
]

export default {
  plugins,
  nodeResolve: true,
  browserStartTimeout: 60000,
  testFramework: {
    config: {
      timeout: 3000,
    },
  },
  // browsers: [
  //   playwrightLauncher({product: 'chromium'}),
  // ],
  files: ['test/**/*.test.js'],
  // Add polyfills for fetch and other browser APIs
  polyfills: {
    fetch: true,
  },
  // Enable experimental features for better MSW support
  experimental: {
    modernWeb: true,
  },
}
