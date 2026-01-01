import fs from 'fs'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { expect, use } from 'chai'
import { schemaMatcher } from '@rinkkasatiainen/cfb-testing-utils'

import { codeFreeze2025Sections } from '../src/entries/well-known-section.js'
import { buildSectionWith } from '../src/builders/cfb-section-models.js'
import { sectionSchema } from '../src/schemas/section-schema.js'

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

describe('mockSectionWith', () => {

  it('a well known section matches to what BE returns', async () => {
    const wellKnown = buildSectionWith({ ...codeFreeze2025Sections.Sat })

    const filePath = contractFilePath('codefreeze2025-sections.json')

    const data = fs.readFileSync(filePath, 'utf8')
    const contract = JSON.parse(data)

    expect(contract[0]).to.eql(wellKnown)
  })

  it('a well known section matches to schema', () => {
    const wellKnown = codeFreeze2025Sections.Sat
    expect(wellKnown).to.matchSchema(sectionSchema)
  })

  it('default builder matches the schema', () => {
    const builtEntry = buildSectionWith()
    expect(builtEntry).to.matchSchema(sectionSchema)
  })
})
