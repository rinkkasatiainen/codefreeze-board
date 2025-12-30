import {use, expect} from 'chai'
import {schemaMatcher} from '@rinkkasatiainen/cfb-testing-utils'
import {
  itemSchema,
  buildItemWith,
} from '@rinkkasatiainen/cfb-npm-template-contracts'

import {startTestWorker, withItems} from '../../mocks/items_mocks.js'
import CfbRetrievesItems from '../../src/ports/cfb-retrieves-items.js'

use(schemaMatcher)

describe('Item Data Contract', () => {
  let worker

  before(async () => {
    worker = startTestWorker()
    await worker.start({quiet: true})
  })

  after(async () => {
    await worker.stop()
  })

  describe('builders', () => {
    it('itemBuilder', () => {
      const item = buildItemWith()

      expect(item).to.matchSchema(itemSchema)
    })
  })

  describe('item-loader', () => {
    let contract
    const testEventId = 'test-event-123'

    before(async () => {
      const response = await fetch('node_modules/@rinkkasatiainen/cfb-npm-template-contracts' +
        '/be-responses/template-items.json', {})
      contract = await response.json()
    })

    beforeEach(() => {
      withItems(testEventId, contract, {})
    })

    afterEach(async () => {
      worker.resetHandlers()
    })

    it('should retrieve items successfully', async () => {
      const items = await CfbRetrievesItems.getItems(testEventId)

      expect(items).to.be.an('array')
      expect(items).to.have.lengthOf(3)
      expect(items[0].id).to.eql('00000000-0000-0000-0000-000000000000')

      items.forEach(item => {
        expect(item).to.matchSchema(itemSchema)
      })
    })

  })
})

