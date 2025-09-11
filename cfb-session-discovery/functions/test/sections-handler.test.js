import { describe, it } from 'mocha'
import { expect } from 'chai'
import { handler } from '../src/sections-handler.js'

describe('Sections Handler', () => {
  it('should return sections data for GET request', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/sections',
    }
    const context = {}

    const result = await handler(event, context)

    expect(result.statusCode).to.equal(200)
    expect(result.headers['Content-Type']).to.equal('application/json')
    expect(result.headers['Access-Control-Allow-Origin']).to.equal('*')

    const body = JSON.parse(result.body)
    expect(body).to.have.property('sections')
    expect(body).to.have.property('eventId', 'codefreeze2025')
    expect(body.sections).to.be.an('array')
    expect(body.sections).to.have.length.greaterThan(0)
    expect(body.sections[0]).to.have.property('id')
    expect(body.sections[0]).to.have.property('name')
    expect(body.sections[0]).to.have.property('date')
    expect(body.sections[0]).to.have.property('order')
  })

  it('should handle OPTIONS request for CORS preflight', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      path: '/api/sections',
    }
    const context = {}

    const result = await handler(event, context)

    expect(result.statusCode).to.equal(200)
    expect(result.headers['Access-Control-Allow-Origin']).to.equal('*')
    expect(result.headers['Access-Control-Allow-Methods']).to.equal('GET,OPTIONS')
    expect(result.body).to.equal('')
  })

  it('should return 405 for unsupported methods', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/api/sections',
    }
    const context = {}

    const result = await handler(event, context)

    expect(result.statusCode).to.equal(405)
    expect(result.headers['Content-Type']).to.equal('application/json')

    const body = JSON.parse(result.body)
    expect(body).to.have.property('error', 'Method not allowed')
  })
})
