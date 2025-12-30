import fs from 'fs'
import path, {dirname} from 'path'
import {fileURLToPath} from 'url'
import {it} from 'mocha'
import {expect, use} from 'chai'
import {schemaMatcher} from '@rinkkasatiainen/cfb-testing-utils'
import {itemSchema} from '@rinkkasatiainen/cfb-npm-template-contracts'

import {handler} from '../../src/item-handler.js'

use(schemaMatcher)

const contractFilePath = fileName => {
  /*
   eslint-disable no-underscore-dangle
   */
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const p = path.join(__dirname, '..', '..', '..', 'fe-contracts', fileName)
  return p
}

describe('Get Items', () => {
  let result
  const event = {
    httpMethod: 'GET',
    path: '/api/event/id/items',
  }
  const context = {}

  beforeEach(async () => {
    result = await handler(event, context)
  })

  it('does match to contract', async () => {
    const items = (await JSON.parse(await result.body)).items

    const p = contractFilePath('template-items.json')
    const expected = fs.readFileSync(p, 'utf8')

    try {
      expect(expected).to.eql(JSON.stringify(items, null, 2))
    } catch (ex) {
      const actualFile = contractFilePath('actual.template-items.json')
      fs.writeFileSync(actualFile, JSON.stringify(items, null, 2))
      console.error('Error in test, files do not match: ' +  actualFile)
      throw ex
    }
  })

  it('follows the schema', async () => {
    const items = (await JSON.parse(await result.body)).items

    expect(items.length).to.be.gt(0)
    items.forEach(item => {
      expect(item).to.matchSchema(itemSchema)
    })
  })
})

