import {expect} from 'chai'
import {http, HttpResponse} from 'msw'
import CfbRetrievesSchedules from '../../src/loads-sections/ports/cfb-retrieves-schedules.js'
import {setupMocks} from '../../mocks/schedules.js'

describe('CfbRetrievesSchedules', () => {
  let worker
  let testEventId

  before(async () => {
    // Setup MSW worker for browser environment
    worker = setupMocks({
      '/schedules': [
        {name: 'Monday', id: 'monday-123', order: 0},
        {name: 'Tuesday', id: 'tuesday-456', order: 1},
        {name: 'Wednesday', id: 'wednesday-789', order: 2},
      ],
    })

    // Start the worker
    await worker.start({quiet: true})
  })

  after(async () => {
    // Clean up
    await worker.stop()
  })

  beforeEach(async () => {
    testEventId = 'test-event-123'
  })

  afterEach(async () => {
    // Reset handlers after each test
    worker.resetHandlers()
  })

  it('should retrieve schedule sections successfully', async () => {
    const sections = await CfbRetrievesSchedules.getScheduleSections(testEventId)

    expect(sections).to.be.an('array')
    expect(sections).to.have.lengthOf(3)
    expect(sections[0]).to.deep.equal({
      name: 'Monday',
      id: 'monday-123',
      order: 0,
    })
    expect(sections[1]).to.deep.equal({
      name: 'Tuesday',
      id: 'tuesday-456',
      order: 1,
    })
    expect(sections[2]).to.deep.equal({
      name: 'Wednesday',
      id: 'wednesday-789',
      order: 2,
    })
  })

  it('should send correct request body with eventId', async () => {
    let capturedRequest = null

    // Override the handler to capture the request
    worker.use(
      http.post('/schedules', async ({request}) => {
        capturedRequest = await request.json()
        return HttpResponse.json({
          sections: [],
        })
      }),
    )

    await CfbRetrievesSchedules.getScheduleSections(testEventId)

    expect(capturedRequest).to.deep.equal({
      eventId: testEventId,
    })
  })

  it('should handle server error gracefully', async () => {
    // Override handler to return error
    worker.use(
      http.post('/schedules', () => HttpResponse.json(
        {error: 'Internal server error'},
        {status: 500},
      )),
    )

    const sections = await CfbRetrievesSchedules.getScheduleSections(testEventId)

    // Should fallback to default sections
    expect(sections).to.be.an('array')
    expect(sections).to.have.lengthOf(7)
    expect(sections[0].name).to.equal('Monday')
    expect(sections[6].name).to.equal('Sunday')
  })

  it('should handle network error gracefully', async () => {
    // Override handler to simulate network error
    worker.use(
      http.post('/schedules', () => HttpResponse.error()),
    )

    const sections = await CfbRetrievesSchedules.getScheduleSections(testEventId)

    // Should fallback to default sections
    expect(sections).to.be.an('array')
    expect(sections).to.have.lengthOf(7)
  })

  it('should handle missing eventId in request', async () => {
    // Override handler to return 400 for missing eventId
    worker.use(
      http.post('/schedules', async ({request}) => {
        const body = await request.json()
        if (!body.eventId) {
          return HttpResponse.json(
            {error: 'eventId is required'},
            {status: 400},
          )
        }
        return HttpResponse.json({sections: []})
      }),
    )

    const sections = await CfbRetrievesSchedules.getScheduleSections('')

    // Should fallback to default sections due to error
    expect(sections).to.be.an('array')
    expect(sections).to.have.lengthOf(7)
  })

  it('should handle empty sections response', async () => {
    // Override handler to return empty sections
    worker.use(
      http.post('/schedules', () => HttpResponse.json({
        sections: [],
      })),
    )

    const sections = await CfbRetrievesSchedules.getScheduleSections(testEventId)

    expect(sections).to.be.an('array')
    expect(sections).to.have.lengthOf(0)
  })

  it('should handle missing sections in response', async () => {
    // Override handler to return response without sections
    worker.use(
      http.post('/schedules', () => HttpResponse.json({
        message: 'Success but no sections',
      })),
    )

    const sections = await CfbRetrievesSchedules.getScheduleSections(testEventId)

    expect(sections).to.be.an('array')
    expect(sections).to.have.lengthOf(0)
  })
})
