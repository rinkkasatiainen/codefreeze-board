import { importMapsPlugin } from '@web/dev-server-import-maps'

export default {
  plugins: [
    importMapsPlugin({
      inject: {
        importMap: {
          imports: {
            // mock a dependency
            //     '/src/ports/cfb-retrieves-schedules.js': '/test/mocks/cfb-retrieves-schedules.js',
          },
        },
      },
    }),
  ],
}
