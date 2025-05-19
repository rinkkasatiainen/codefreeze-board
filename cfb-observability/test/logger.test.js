import { expect } from '@open-wc/testing'
import { createLogger, LOG_LEVELS } from '../src/logger.js'
import sinon from 'sinon'

describe('Logger', () => {
  let logger
  let consoleSpy

  beforeEach(() => {
    consoleSpy = {
      debug: sinon.stub(console, 'debug'),
      info: sinon.stub(console, 'info'),
      warn: sinon.stub(console, 'warn'),
      error: sinon.stub(console, 'error'),
    }
    logger = createLogger()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should create a logger with default options', () => {
    expect(logger).to.be.instanceOf(Object)
    expect(logger.minLevel).to.equal(LOG_LEVELS.INFO)
    expect(logger.prefix).to.equal('')
    expect(logger.timestamp).to.be.true
  })

  const logLevelTestCasesForDebug = [
    { level: LOG_LEVELS.DEBUG, method: 'debug', shouldLog: true },
    { level: LOG_LEVELS.INFO, method: 'info', shouldLog: true }, 
    { level: LOG_LEVELS.WARN, method: 'warn', shouldLog: true },
    { level: LOG_LEVELS.ERROR, method: 'error', shouldLog: true },
  ]
  const logLevelTestCasesForInfo = [
    { level: LOG_LEVELS.DEBUG, method: 'debug', shouldLog: false },
    { level: LOG_LEVELS.INFO, method: 'info', shouldLog: true },
    { level: LOG_LEVELS.WARN, method: 'warn', shouldLog: true },
    { level: LOG_LEVELS.ERROR, method: 'error', shouldLog: true },
  ]
  const logLevelTestCasesForWarn = [
    { level: LOG_LEVELS.DEBUG, method: 'debug', shouldLog: false },
    { level: LOG_LEVELS.INFO, method: 'info', shouldLog: false },
    { level: LOG_LEVELS.WARN, method: 'warn', shouldLog: true },
    { level: LOG_LEVELS.ERROR, method: 'error', shouldLog: true },
  ]
  const logLevelTestCasesForError = [
    { level: LOG_LEVELS.DEBUG, method: 'debug', shouldLog: false },
    { level: LOG_LEVELS.INFO, method: 'info', shouldLog: false },
    { level: LOG_LEVELS.WARN, method: 'warn', shouldLog: false },
    { level: LOG_LEVELS.ERROR, method: 'error', shouldLog: true },
  ]

  logLevelTestCasesForInfo.forEach(({ level, method, shouldLog }) => {
    it(`By default, when calling ${method}, it should ${shouldLog} log`, () => {
      const customLogger = createLogger()
      customLogger[method]('test message1')
      expect(consoleSpy[method].called).to.equal(shouldLog)
    })
  })

  logLevelTestCasesForDebug.forEach(({ level, method, shouldLog }) => {
    it(`On DEBUG log, when calling ${method}, it should ${shouldLog} log`, () => {
      const customLogger = createLogger({
        minLevel: LOG_LEVELS.DEBUG,
      })
      customLogger[method]('test message2')
      expect(consoleSpy[method].called).to.equal(shouldLog)
    })
  })
  logLevelTestCasesForWarn.forEach(({ level, method, shouldLog }) => {
    it(`On Warn log, when calling ${method}, it should ${shouldLog} log`, () => {
      const customLogger = createLogger({
        minLevel: LOG_LEVELS.WARN,
      })
      customLogger[method]('test message3')
      expect(consoleSpy[method].called).to.equal(shouldLog)
    })
  })
  logLevelTestCasesForError.forEach(({ level, method, shouldLog }) => {
    it(`On Error log, when calling ${method}, it should ${shouldLog} log`, () => {
      const customLogger = createLogger({
        minLevel: LOG_LEVELS.ERROR,
      })
      customLogger[method]('test message4')
      expect(consoleSpy[method].called).to.equal(shouldLog)
    })
  })

  it('should format messages with prefix and timestamp', () => {
    logger.setPrefix('TestPrefix')
    logger.info('test message')

    const callArgs = consoleSpy.info.firstCall.args
    expect(callArgs[0]).to.include('[TestPrefix]')
    expect(callArgs[0]).to.include('[INFO]')
    expect(callArgs[0]).to.include('test message')
    expect(callArgs[0]).to.match(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('should handle additional arguments', () => {
    const obj = { test: 'value' }
    logger.info('test message', obj)

    const callArgs = consoleSpy.info.firstCall.args
    expect(callArgs[0]).to.include('test message')
    expect(callArgs[1]).to.deep.equal(obj)
  })

  it('should allow changing log level', () => {
    logger.setMinLevel(LOG_LEVELS.DEBUG)
    logger.debug('debug message')
    expect(consoleSpy.debug.called).to.be.true

    logger.setMinLevel(LOG_LEVELS.ERROR)
    expect(logger.minLevel).to.equal(LOG_LEVELS.ERROR)
  })

  it('should allow changing prefix', () => {
    logger.setPrefix('NewPrefix')
    expect(logger.prefix).to.equal('NewPrefix')
  })

  it('should allow toggling timestamp', () => {
    logger.disableTimestamp()
    expect(logger.timestamp).to.be.false

    logger.enableTimestamp()
    expect(logger.timestamp).to.be.true
  })
}) 
