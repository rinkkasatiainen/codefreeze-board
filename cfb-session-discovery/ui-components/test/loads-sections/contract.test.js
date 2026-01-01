import { expect } from 'chai'
import { waitUntil } from '@rinkkasatiainen/cfb-testing-utils'
import { WellKnown } from '@rinkkasatiainen/cfb-session-discovery-contracts'

import { CfbSchedule } from '../../src/loads-sections/components/cfb-schedule.js'
import cfbScheduleStorage from '../../src/loads-sections/ports/cfb-schedule-storage.js'
import { withClearableStorage } from '../test-helpers.js'

describe('CfbSchedule', () => {
  let testRoot = null

  before(async () => {
    await cfbScheduleStorage.init()

    customElements.define(CfbSchedule.elementName, CfbSchedule)
  })

  beforeEach(() => {
    testRoot = document.createElement('div')
    testRoot.id = 'test-root'
    document.body.appendChild(testRoot)
  })

  const eventId = 'test-event-contract-test'

  afterEach(async () => {
    withClearableStorage(cfbScheduleStorage).clearAll(eventId)
    document.querySelectorAll('#test-root').forEach(el => el.remove())
  })

  describe('Cfb-Schedule', () => {
    it('does load Codefreeze 2025', async () => {
      for (const x of WellKnown.section.codefreeze2025) {
        await cfbScheduleStorage.addSection(eventId, x)
      }
      const sut = await schedule()

      await waitUntil(sut.whenNoOfSectionsIs(WellKnown.section.codefreeze2025.length))

      const sections = Array.from(sut.getSections()).map(el => el.getAttribute('data-name'))
      expect(sections).to.eql(WellKnown.section.codefreeze2025.map(x => x.name))
    })

  })

  const schedule = (params = {}) => {
    const sut = document.createElement(CfbSchedule.elementName)
    sut.setAttribute(CfbSchedule.definedAttributes.eventId, eventId)
    Object.entries(params).forEach(([key, value]) => {
      sut.setAttribute(key, value)
    })

    sut.getSections = () => sut.querySelectorAll('cfb-section')
    sut.whenNoOfSectionsIs = expected => () => sut.getSections().length === expected

    testRoot.appendChild(sut)
    return sut
  }
})
