import {CfbScheduleLoader} from './src/components/cfb-schedule-loader.js'
import cfbScheduleStorage from './src/ports/cfb-schedule-storage.js'

export class SchedulingModule {
  // TODO: later - use features here
  async configure() {
    customElements.define(CfbScheduleLoader.elementName, CfbScheduleLoader)
    await cfbScheduleStorage.init()
  }

  async activate() {
  }

  async run() {
    // Empty run method
  }
}
