import { codefreeze2025 } from '../mocks/section-entry.js'
import { verifyAccessToken, extractAccessToken } from './auth-utilities.js'

/**
 * AWS Lambda handler for retrieving section entries
 * @param {Object} event - API Gateway event
 * @param {Object} _context - Lambda context
 * @returns {Object} API Gateway response
 */
export const handler = async (event, _context) => {
  try {
    // Set CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    }

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      }
    }

    // Verify authentication token
    const accessToken = extractAccessToken(event)
    const userPoolId = process.env.USER_POOL_ID
    let authorized = false

    if (accessToken && userPoolId) {
      authorized = await verifyAccessToken(accessToken, userPoolId)
    }

    const sections = Object.values(codefreeze2025)

    // Handle GET request
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          sections,
          eventId: 'codefreeze2025',
          authorized,
        }),
      }
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  } catch (error) {
    // TODO: AkS: add observability here
    console.error('Error in sections handler:', error) // eslint-disable-line no-console

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    }
  }
}

