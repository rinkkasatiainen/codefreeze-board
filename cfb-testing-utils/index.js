import { createTestLogger as testLogger } from './src/test-logger.js'

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

export const createLogger = testLogger // TestFail Logger for @cfb-observability
export const createTestLogger = testLogger

export { waitUntil } from './src/wait-until.js'
