import {CfbScheduleLoader} from './src/loads-sections/components/cfb-schedule-loader.js'
import {CfbSchedule} from './src/loads-sections/components/cfb-schedule.js'
import {CfbSection} from './src/loads-sections/components/cfb-section.js'
import {CfbSessionLoader} from './src/loads-sections/components/cfb-session-loader.js'
import {CfbSession} from './src/loads-sections/components/cfb-session.js'
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
    customElements.define(CfbSession.elementName, CfbSession)
    customElements.define(CfbSessionLoader.elementName, CfbSessionLoader)
  }
}

// Export components for direct use
export {CfbScheduleLoader, CfbSchedule, CfbSection}
