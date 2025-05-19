/**
 * Logger implementation for CFB
 * Provides different log levels and formatting capabilities
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

class Logger {
  constructor(options = {}) {
    this.minLevel = options.minLevel === undefined? LOG_LEVELS.INFO : options.minLevel
    this.prefix = options.prefix || ''
    this.timestamp = options.timestamp !== false
  }

  #formatMessage(level, message, ...args) {
    const timestamp = this.timestamp ? `[${new Date().toISOString()}] ` : ''
    const prefix = this.prefix ? `[${this.prefix}] ` : ''
    const levelStr = `[${level}] `
    return `${timestamp}${prefix}${levelStr}${message}`
  }

  #log(level, levelValue, message, ...args) {
    if (levelValue >= this.minLevel) {
      const formattedMessage = this.#formatMessage(level, message)
      switch (level) {
      case 'ERROR':
        console.error(formattedMessage, ...args) // eslint-disable-line no-console
        break
      case 'WARN':
        console.warn(formattedMessage, ...args) // eslint-disable-line no-console
        break
      case 'INFO':
        console.info(formattedMessage, ...args) // eslint-disable-line no-console
        break
      case 'DEBUG':
        console.debug(formattedMessage, ...args) // eslint-disable-line no-console  
        break
      }
    }
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
    if (level !== undefined) {
      this.minLevel = level
    }
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
}

export const createLogger = options => new Logger(options)
export { LOG_LEVELS } 
