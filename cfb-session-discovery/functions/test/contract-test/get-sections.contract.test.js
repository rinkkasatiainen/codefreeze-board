import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { it } from 'mocha'
import { expect, use } from 'chai'
import { schemaMatcher } from '@rinkkasatiainen/cfb-testing-utils'
import { sectionSchema } from '@rinkkasatiainen/cfb-session-discovery-contracts'

import { handler } from '../../src/sections-handler.js'

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

describe('Get Sections', () => {
  let result
  const event = {
    httpMethod: 'GET',
    path: '/api/event/id/sections',
  }
  const context = {}

  beforeEach(async () => {
    result = await handler(event, context)
  })

  it('does write to contract', async () => {
    const sections = (await JSON.parse(await result.body)).sections

    const p = contractFilePath('codefreeze2025-sections.json')
    const expected = fs.readFileSync(p, 'utf8')

    expect(expected).to.eql(JSON.stringify(sections, null, 2))
  })

  it('follows the schema', async () => {
    const sections = (await JSON.parse(await result.body)).sections

    expect(sections.length).to.be.gt(0)
    sections.forEach(section => {
      expect(section).to.matchSchema(sectionSchema)
    })
  })
})
