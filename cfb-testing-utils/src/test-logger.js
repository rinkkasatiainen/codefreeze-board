// eslint-disable-next-line max-classes-per-file
import {LOG_LEVELS} from '@rinkkasatiainen/cfb-observability'

// Logger interface is as follows:
// debug(message, ...args)
// info(message, ...args)
// warn(message, ...args)
// error(message, ...args)
// setMinLevel(level)
// setPrefix(prefix)
// enableTimestamp()

class TestLogger {
  constructor(options = {}) {
    this.minLevel = options.minLevel || 'ERROR'
    this.prefix = options.prefix
    this.timestamp = options.timestamp
  }

  debug(message, ...args) {
    this.#log('DEBUG', LOG_LEVELS.DEBUG, message, ...args)
  }

  info(message, ...args) {
    this.#log('INFO', LOG_LEVELS.INFO, message, ...args)
  }

  warn(message, ...args) {
    this.#log('WARN', LOG_LEVELS.WARN, message, ...args)
  }

  error(message, ...args) {
    this.#log('ERROR', LOG_LEVELS.ERROR, message, ...args)
  }

  setMinLevel(level) {
    this.minLevel = level
  }

  setPrefix(prefix) {
    this.prefix = prefix
  }

  enableTimestamp() {
    this.timestamp = true
  }

  disableTimestamp() {
    this.timestamp = false
  }

  #expectations = {
    debug: [],
    info: [],
    warn: [],
    error: [],
  }

  #addExpectation(level, predicate, times) {
    this.#expectations[level.toLowerCase()].push({
      predicate,
      times,
      called: 0,
    })
  }

  #checkExpectation(level, message, ...args) {
    const expectations = this.#expectations[level.toLowerCase()]
    if (expectations.length === 0) {
      return false
    }

    const expectation = expectations[0]
    const result = expectation.predicate(message, ...args)
    if (result) {
      expectation.called++
      if (expectation.called === expectation.times) {
        expectations.shift()
      }
      return true
    }
    return false
  }

  expect = {
    debug: (predicate, times) => {
      this.#addExpectation('DEBUG', typeof predicate === 'function' ? predicate : () => predicate, times)
    },
    info: (predicate, times) => {
      this.#addExpectation('INFO', typeof predicate === 'function' ? predicate : () => predicate, times)
    },
    warn: (predicate, times) => {
      this.#addExpectation('WARN', typeof predicate === 'function' ? predicate : () => predicate, times)
    },
    error: (predicate, times) => {
      this.#addExpectation('ERROR', typeof predicate === 'function' ? predicate : () => predicate, times)
    },
  }

  #log(level, levelValue, message, ...args) {
    const minLevelValue = this.minLevel === undefined ? 3 : LOG_LEVELS[this.minLevel]

    if (levelValue < minLevelValue) {

      if (this.#checkExpectation(level, message, ...args)) {
        return
      }
      throw new Error(`Log level ${level} is below minimum level ${this.minLevel}`)
    }

    if (levelValue === LOG_LEVELS.ERROR) {
      if (this.#checkExpectation(level, message, ...args)) {
        return
      }
      throw new Error('Logging ERROR should fail the test case')
    }

    switch (level) {
    case 'DEBUG':
      console.debug(message, ...args) // eslint-disable-line no-console
      return
    case 'INFO':
      console.info(message, ...args) // eslint-disable-line no-console
      return
    case 'WARN':
      console.warn(message, ...args) // eslint-disable-line no-console
      return
    case 'ERROR':
      console.error(message, ...args) // eslint-disable-line no-console
      return
    }
  }

}

const singletonLogger = new TestLogger()
export const createTestLogger = _ => {
  singletonLogger.setMinLevel('ERROR')
  return singletonLogger
}

export class Times {
  static once = 'once'
}
