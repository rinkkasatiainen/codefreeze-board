import {CfbScheduleLoader} from './src/components/cfb-schedule-loader.js'
import cfbScheduleStorage from './src/ports/cfb-schedule-storage.js'

export class SessionDiscoveryModule {
  // TODO: later - use features here
  async configure() {
    await cfbScheduleStorage.init()
  }

  async activate() {
  }

  async run() {
    customElements.define(CfbScheduleLoader.elementName, CfbScheduleLoader)
  }
}
