import {todo} from '@rinkkasatiainen/cfb-testing-utils'

import {CfbScheduleOrchestratorElement} from '../../../src/scheduler/components/cfb-schedule-orchestrator.js'

describe('CfbScheduleOrchestratorElement', () => {
  let testRoot = null

  before(() => {
    customElements.define(CfbScheduleOrchestratorElement.elementName, CfbScheduleOrchestratorElement)
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
  })

  beforeEach(() => {
    document.body.appendChild(testRoot)
  })

  afterEach(() => {
    document.querySelectorAll('#test-root').forEach(el => el.innerHTML = '')
  })

  // Test list - implementation will be added later
  todo('should listen to sessions loaded event')

  todo('should listen to sections loaded event')

  todo('should track when both events have been received')

  todo('should update children with class listens-schedule-updates when both events are received')

  todo('should set data-updated-at attribute to current timestamp on children')

  todo('should only update children once both events are received')

  todo('should not update children if only one event is received')

  todo('should handle multiple children with listens-schedule-updates class')

  todo('should clean up event listeners when element is disconnected')
})
