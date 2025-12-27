import {it} from 'mocha'
import {handler} from '../../src/sessions-handler.js'
import fs from 'fs'
import path, {dirname} from 'path'
import {fileURLToPath} from 'url'
import {AssertionError, expect, use} from 'chai'
import { schemaMatcher } from '@rinkkasatiainen/cfb-testing-utils'
import {sessionSchema} from '../../_contracts/section-schema.js'

use(schemaMatcher)

const contractFilePath = fileName => {
  /*
   eslint-disable no-underscore-dangle
   */
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const p = path.join(__dirname, '..', '..', '..', 'contracts', fileName)
  return p
}

describe('Get sessions', () => {
  let result
  const event = {
    httpMethod: 'GET',
    path: '/api/event/id/sessions',
  }
  const context = {}

  beforeEach(async () => {
    result = await handler(event, context)
  })

  it('does write to contract', async () => {
    const sections = (await JSON.parse(await result.body)).sessions

    const p = contractFilePath('codefreeze2025-sessions.json')
    fs.writeFile(p, JSON.stringify(sections, null, 2), err => {
      if (err) {
        throw new AssertionError(`writing to file failed: ${err.message}` )
      }
    })
  })

  it('follows the schema', async () => {
    const sessions = (await JSON.parse(await result.body)).sessions

    expect(sessions.length).to.be.gt(0)
    sessions.forEach(section => {
      expect(section).to.matchSchema(sessionSchema)
    })
  })
})
