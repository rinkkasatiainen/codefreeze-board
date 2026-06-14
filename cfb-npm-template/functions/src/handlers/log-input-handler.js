import {withStream} from '@rinkkasatiainen/cfb-event-sourcing-aws'
import {logLatestInput} from '../actions/log-latest-input.js'

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
}

/**
 * AWS Lambda handler for logging input events (Port/Adapter layer)
 *
 * This handler is a thin port that:
 * 1. Handles HTTP-level concerns (CORS, parsing)
 * 2. Validates input structure (not business rules)
 * 3. Delegates to domain logic
 * 4. Transforms domain results to HTTP responses
 */
export const handler = async (event, _context) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {statusCode: 200, headers, body: ''}
  }

  // Parse and validate input structure
  const body = JSON.parse(event.body || '{}')
  const input = body.input

  if (!input || typeof input !== 'string') {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({error: 'Invalid input: expected string'}),
    }
  }
  const result = await logLatestInput(withStream)(input)

  // Transform domain result to HTTP response
  return result.fold(
    error => ({
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({error: error.message}),
    }),
    ({eventCount}) => ({
      statusCode: 200,
      headers,
      body: JSON.stringify({success: true, eventsAppended: eventCount}),
    }),
  )
}
