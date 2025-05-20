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
    this.minLevel = options.minLevel || 'DEBUG'
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

  #log(level, levelValue, message, ...args) {
    const minLevelValue = this.minLevel === undefined? 3 : LOG_LEVELS[this.minLevel]

    console.log(level, levelValue, minLevelValue,  message, ...args)
    if (levelValue < minLevelValue ) {
      throw new Error(`Log level ${level} is below minimum level ${this.minLevel}`)
    }

    if (levelValue === LOG_LEVELS.ERROR) {
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

export const createTestLogger = options => new TestLogger(options) 

export class Times {
  static once = 'once'
}
