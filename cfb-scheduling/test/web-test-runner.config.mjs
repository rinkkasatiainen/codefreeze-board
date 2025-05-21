import { importMapsPlugin } from '@web/dev-server-import-maps'

export default {
  plugins: [
    importMapsPlugin({
      inject: {
        importMap: {
          imports: {
            // mock a dependency
            // This should be more specific for the logging purposes. To be fixed.
            // '@rinkkasatiainen/cfb-observability': '../../node_modules/@rinkkasatiainen/cfb-testing-utils/index.js',
            '@rinkkasatiainen/cfb-observability': './test/fakes/test-fail-logger.js',
            //     '/src/ports/cfb-retrieves-schedules.js': '/test/mocks/cfb-retrieves-schedules.js',
          },
        },
      },
    }),
  ],
}
