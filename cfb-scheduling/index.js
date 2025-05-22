import {CfbScheduleLoader} from './src/components/cfb-schedule-loader.js'
import cfbScheduleStorage from './src/ports/cfb-schedule-storage.js'

export class SchedulingModule {
  // TODO: later - use features here
  configure() {
    customElements.define(CfbScheduleLoader.elementName, CfbScheduleLoader)
  }

  async activate() {
    await cfbScheduleStorage.init()
  }

  run() {
    // Empty run method
  }
}
