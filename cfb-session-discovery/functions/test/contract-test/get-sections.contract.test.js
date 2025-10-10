import {it} from 'mocha'
import {handler} from '../../src/sections-handler.js'
import fs from 'fs'
import path, {dirname} from 'path'
import {fileURLToPath} from 'url'

describe('Get Sections', () => {
  it('does write to contract', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sections',
    }
    const context = {}

    const result = await handler(event, context)
    // Get the current module's URL
    /*
     eslint-disable no-underscore-dangle
     */
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const p = path.join(__dirname, '..', '..', '..', 'contracts', 'codefreeze2025-sections.json')

    const sections = (await JSON.parse(await result.body)).sections
    fs.writeFile(p, JSON.stringify(sections, null, 2), err => {
      if (err) {
        console.error(err)
      } else {
        // file written successfully
      }
    })

  })
})
