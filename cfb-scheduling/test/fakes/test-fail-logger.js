import {createTestLogger} from '@rinkkasatiainen/cfb-testing-utils'

// copied from @rinkkasatiainen/cfb-board
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

export const createLogger = createTestLogger
