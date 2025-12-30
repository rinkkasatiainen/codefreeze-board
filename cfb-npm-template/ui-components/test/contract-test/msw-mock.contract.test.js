import {WellKnown, itemSchema} from '@rinkkasatiainen/cfb-npm-template-contracts'
import {schemaMatcher} from '@rinkkasatiainen/cfb-testing-utils'
import {use, expect} from 'chai'

import {startTestWorker, withItems} from '../../mocks/items_mocks.js'

use(schemaMatcher)

const eventId = 'eventId'

describe('mocks for UI', () => {
  let worker

  before(async () => {
    worker = startTestWorker()
    await worker.start({quiet: true})
  })

  after(async () => {
    await worker.stop()
  })

  afterEach(() => {
    worker.resetHandlers()
  })

  it('does magic', async () => {
    withItems(eventId, WellKnown.items)

    const itemsResponse = await fetch(`/api/event/${eventId}/items`)
    const itemsData = await itemsResponse.json()

    const items = itemsData.items
    expect(items).to.have.lengthOf(3)
    items.forEach(it => expect(it).to.matchSchema(itemSchema))
  })
})
