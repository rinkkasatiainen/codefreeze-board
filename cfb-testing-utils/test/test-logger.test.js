import { expect } from '@open-wc/testing'
import { createTestLogger } from '../src/test-logger.js'
import sinon from 'sinon'

describe('TestLogger', () => {
  let logger
  let consoleSpy

  beforeEach(() => {
    consoleSpy = {
      debug: sinon.spy(console, 'debug'),
      info: sinon.spy(console, 'info'),
      warn: sinon.spy(console, 'warn'),
      error: sinon.spy(console, 'error'),
    }
    logger = createTestLogger()
  })

  afterEach(() => {
    sinon.restore()
  })

  const noop = () => { /* noop */ }
  const todo = testName => {
    xit(testName, noop) 
  }

  it('Should throw error when logging debug message with minLevel set to INFO', () => {
    logger.setMinLevel('INFO')
    expect(() => logger.debug('test message debug')).to.throw('Log level DEBUG is below minimum level INFO')
  })

  it('Should throw error when logging info message with minLevel set to WARN', () => {
    logger.setMinLevel('WARN') 
    expect(() => logger.info('test message warn')).to.throw('Log level INFO is below minimum level WARN')
  })

  it('Should throw error when logging warn message with minLevel set to ERROR', () => {
    logger.setMinLevel('ERROR')
    expect(() => logger.warn('test message error')).to.throw('Log level WARN is below minimum level ERROR')
  })

  it('Should throw error when logging error message regardless of the level', () => {
    logger.setMinLevel('ERROR')
    expect(() => logger.error('test message error')).to.throw('Logging ERROR should fail the test case')
  })

  it('Should log debug message to console.debug when called', () => {
    logger.debug('test debug message')
    expect(consoleSpy.debug).to.have.been.calledWith('test debug message')
  })

  it('Should log info message to console.info when called', () => {
    logger.info('test info message')
    expect(consoleSpy.info).to.have.been.calledWith('test info message')
  })

  it('Should log warn message to console.warn when called', () => {
    logger.warn('test warn message')
    expect(consoleSpy.warn).to.have.been.calledWith('test warn message')
  })

  todo('Should allow a log debug message to be sent, if defined explicitly')
  todo('Should allow a log info message to be sent, if defined explicitly')
  todo('Should allow a log warn message to be sent, if defined explicitly')
  todo('Should allow a log error message to be sent, if defined explicitly')
})
