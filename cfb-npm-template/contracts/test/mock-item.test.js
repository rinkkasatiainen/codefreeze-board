import fs from 'fs'
import {fileURLToPath} from 'url'
import path, {dirname} from 'path'
import {expect, use} from 'chai'
import {schemaMatcher} from '@rinkkasatiainen/cfb-testing-utils'

import {wellKnownItems} from '../src/entries/well-known-item.js'
import {buildItemWith} from '../src/builders/cfb-item-models.js'
import {itemSchema} from '../src/schemas/item-schema.js'

use(schemaMatcher)

const contractFilePath = fileName => {
  /*
   eslint-disable no-underscore-dangle
   */
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const p = path.join(__dirname, '..', 'be-responses', fileName)
  return p
}

describe('mockItemWith', () => {

  it('a well known item matches to what BE returns', async () => {
    const wellKnown1 = buildItemWith({...wellKnownItems.Item1})
    const wellKnown2 = buildItemWith({...wellKnownItems.Item2})
    const wellKnown3 = buildItemWith({...wellKnownItems.Item3})

    const filePath = contractFilePath('template-items.json')

    const data = fs.readFileSync(filePath, 'utf8')
    const contract = JSON.parse(data)

    expect(contract).to.eql([wellKnown1, wellKnown2, wellKnown3])
  })

  it('a well known item matches to schema', () => {
    const wellKnown = wellKnownItems.Item1
    expect(wellKnown).to.matchSchema(itemSchema)
  })

  it('default builder matches the schema', () => {
    const builtEntry = buildItemWith()
    expect(builtEntry).to.matchSchema(itemSchema)
  })
})

