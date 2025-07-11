import {CfbScheduleLoader} from './src/loads-sections/components/cfb-schedule-loader.js'
import {CfbSchedule} from './src/loads-sections/components/cfb-schedule.js'
import {CfbSection} from './src/loads-sections/components/cfb-section.js'
import cfbScheduleStorage from './src/loads-sections/ports/cfb-schedule-storage.js'

export class SessionDiscoveryModule {
  // TODO: later - use features here
  async configure() {
    await cfbScheduleStorage.init()
  }

  async activate() {
  }

  async run() {
    customElements.define(CfbScheduleLoader.elementName, CfbScheduleLoader)
    customElements.define(CfbSchedule.elementName, CfbSchedule)
    customElements.define(CfbSection.elementName, CfbSection)
  }
}

// Export components for direct use
export {CfbScheduleLoader, CfbSchedule, CfbSection}
