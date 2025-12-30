import { describe, it } from 'mocha'
import { expect } from 'chai'
import { handler } from '../src/item-handler.js'

describe('Items Handler', () => {
  it('should return items data for GET request', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/api/items',
    }
    const context = {}

    const result = await handler(event, context)

    expect(result.statusCode).to.equal(200)
    expect(result.headers['Content-Type']).to.equal('application/json')
    expect(result.headers['Access-Control-Allow-Origin']).to.equal('*')

    const body = JSON.parse(result.body)
    expect(body).to.have.property('items')
    expect(body).to.have.property('eventId', 'template2025')
    expect(body.items).to.be.an('array')
    expect(body.items).to.have.length.greaterThan(0)
    expect(body.items[0]).to.have.property('id')
    expect(body.items[0]).to.have.property('name')
    expect(body.items[0]).to.have.property('tags')
  })

  it('should handle OPTIONS request for CORS preflight', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      path: '/api/items',
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
      path: '/api/items',
    }
    const context = {}

    const result = await handler(event, context)

    expect(result.statusCode).to.equal(405)
    expect(result.headers['Content-Type']).to.equal('application/json')

    const body = JSON.parse(result.body)
    expect(body).to.have.property('error', 'Method not allowed')
  })
})
